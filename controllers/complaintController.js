const Complaint =
require("../models/Complaint");

const User =
require("../models/User");

const Faculty =
require("../models/Faculty");

const sendNotification =
require("../utils/sendNotification");

// =====================================
// SUBMIT COMPLAINT
// =====================================

exports.submitComplaint = async (req, res) => {

  try {

    console.log("BODY:", req.body);

    const {
      studentName,
      rollNumber,
      department,
      category,
      complaintText,
      complaintTo,
      facultyId,
      facultyName
    } = req.body;

    console.log("complaintTo =", complaintTo);
    console.log("facultyId =", facultyId);
    console.log("facultyName =", facultyName);

    // =====================
    // FILE
    // =====================

    let fileUrl = "";

    if (req.file) {

      fileUrl =
        `http://192.168.31.250:5000/uploads/${req.file.filename}`;

    }

    // =====================
    // CREATE COMPLAINT
    // =====================

    const complaint = await Complaint.create({

      studentName,

      rollNumber,

      department,

      complaintTo:
        complaintTo || "PRINCIPAL_HOD",

      facultyId:
        facultyId || null,

      facultyName:
        facultyName || "",

      category,

      complaintText,

      fileUrl

    });

    // =====================================
    // SEND NOTIFICATION
    // =====================================

    try {

      let recipients = [];

      // =====================================
      // FACULTY COMPLAINT
      // =====================================

      if (
        complaintTo === "FACULTY" &&
        facultyId
      ) {

        const faculty =
          await Faculty.findById(facultyId)
            .select("expoPushToken name department");

        if (
          faculty &&
          faculty.expoPushToken
        ) {

          recipients.push(
            faculty.expoPushToken
          );

        }

      }

      // =====================================
      // PRINCIPAL + HOD COMPLAINT
      // =====================================

      else {

        // -------------------------------------
        // FIND PRINCIPAL
        // -------------------------------------

        const principal =
          await User.findOne({
            role: "PRINCIPAL",
            expoPushToken: {
              $exists: true,
              $nin: [null, ""]
            }
          }).select("expoPushToken");

        if (
          principal &&
          principal.expoPushToken
        ) {

          recipients.push(
            principal.expoPushToken
          );

        }

        // -------------------------------------
        // FIND DEPARTMENT HOD
        // -------------------------------------

        let departments = [department];

        // CSE and AIML share complaints
        if (department === "CSE") {
          departments.push("AIML");
        }

        if (department === "AIML") {
          departments.push("CSE");
        }

        const hods =
          await User.find({

            role: "HOD",

            department: {
              $in: departments
            },

            expoPushToken: {
              $exists: true,
              $nin: [null, ""]
            }

          }).select("expoPushToken");

        hods.forEach((hod) => {

          if (hod.expoPushToken) {

            recipients.push(
              hod.expoPushToken
            );

          }

        });

      }

      // =====================================
      // REMOVE DUPLICATE TOKENS
      // =====================================

      const uniqueTokens =
        [...new Set(recipients)];

      // =====================================
      // SEND
      // =====================================

      if (uniqueTokens.length > 0) {

        await sendNotification({

          expoPushTokens:
            uniqueTokens,

          title:
            "📝 New Complaint",

          body:
            `${studentName} submitted a complaint: ${category}`,

          data: {

            type:
              "COMPLAINT",

            complaintId:
              complaint._id.toString(),

            complaintTo:
              complaintTo ||
              "PRINCIPAL_HOD",

            department,

            rollNumber

          }

        });

      } else {

        console.log(
          "No recipients with push tokens found for complaint."
        );

      }

    } catch (notificationError) {

      // =====================================
      // IMPORTANT
      // =====================================
      // Notification failure must NOT
      // make complaint submission fail.

      console.log(
        "COMPLAINT NOTIFICATION ERROR:",
        notificationError
      );

    }

    // =====================================
    // RESPONSE
    // =====================================

    res.status(201).json({

      success: true,

      message:
        "Complaint Submitted Successfully",

      complaint

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};

// =====================================
// GET ALL COMPLAINTS
// PRINCIPAL
// =====================================

exports.getComplaints =
async (req, res) => {

  try {

    const complaints = await Complaint.find({
  complaintTo: "PRINCIPAL_HOD",
}).sort({ createdAt: -1 });

    res.status(200).json({

      success: true,

      complaints

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};

// =====================================
// DEPARTMENT COMPLAINTS
// HOD
// =====================================

exports.getDepartmentComplaints = async (req, res) => {

  try {

    const { department } = req.params;

    let departments = [department];

    // CSE and AIML share complaints
    if (department === "CSE") {
      departments.push("AIML");
    }

    if (department === "AIML") {
      departments.push("CSE");
    }

    const complaints = await Complaint.find({
      department: { $in: departments },
      complaintTo: "PRINCIPAL_HOD",
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      complaints,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

};



// ======================================
// STUDENT COMPLAINTS
// ======================================

exports.getStudentComplaints =
async (req, res) => {

  try {

    const { rollNumber } =
      req.params;

    const complaints =
      await Complaint.find({

        rollNumber

      }).sort({

        createdAt: -1

      });

    res.status(200).json({

      success: true,

      complaints

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};


// =====================================
// UPDATE STATUS + REPLY
// =====================================

// =====================================
// UPDATE STATUS + REPLY
// =====================================

exports.updateComplaintStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      status,
      reply
    } = req.body;

    // =========================
    // UPDATE COMPLAINT
    // =========================

    const complaint =
      await Complaint.findByIdAndUpdate(

        id,

        {
          status,
          reply
        },

        {
          new: true
        }

      );

    // =========================
    // CHECK COMPLAINT
    // =========================

    if (!complaint) {

      return res.status(404).json({

        success: false,

        message:
          "Complaint not found"

      });

    }

    // =====================================
    // SEND NOTIFICATION TO STUDENT
    // =====================================

    try {

      const student =
        await User.findOne({

          rollNumber:
            complaint.rollNumber,

          expoPushToken: {
            $exists: true,
            $nin: [null, ""]
          }

        }).select("expoPushToken name");

      // =========================
      // SEND
      // =========================

      if (
        student &&
        student.expoPushToken
      ) {

        await sendNotification({

          expoPushTokens:
            student.expoPushToken,

          title:
            "📝 Complaint Updated",

          body:
            `Your complaint status is now: ${status}`,

          data: {

            type:
              "COMPLAINT_UPDATE",

            complaintId:
              complaint._id.toString(),

            status:
              status || "",

            reply:
              reply || ""

          }

        });

      } else {

        console.log(
          "Student push token not found for:",
          complaint.rollNumber
        );

      }

    } catch (notificationError) {

      // =====================================
      // IMPORTANT
      // =====================================
      // Notification failure should NOT
      // make complaint update fail.

      console.log(
        "COMPLAINT UPDATE NOTIFICATION ERROR:",
        notificationError
      );

    }

    // =========================
    // RESPONSE
    // =========================

    res.status(200).json({

      success: true,

      message:
        "Complaint Updated Successfully",

      complaint

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};

// =====================================
// FACULTY COMPLAINTS
// =====================================

exports.getFacultyComplaints = async (req, res) => {

  try {

    const { facultyId } = req.params;

    const complaints = await Complaint.find({
      complaintTo: "FACULTY",
      facultyId
    }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      complaints
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};