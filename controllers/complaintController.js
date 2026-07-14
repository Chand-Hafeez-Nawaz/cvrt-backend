const Complaint =
require("../models/Complaint");

// =====================================
// SUBMIT COMPLAINT
// =====================================

exports.submitComplaint =
async (req, res) => {

  try {

    const {

      studentName,
      rollNumber,
      department,
      category,
      complaintText

    } = req.body;

    // =====================
    // FILE
    // =====================

    let fileUrl = "";

    if (req.file) {

      fileUrl =

      `http://192.168.31.250:5000/uploads/${req.file.filename}`;

    }

    // =====================
    // CREATE
    // =====================

    const complaint =

      await Complaint.create({

        studentName,
        rollNumber,
        department,
        category,
        complaintText,
        fileUrl

      });

    res.status(201).json({

      success: true,

      message:
        "Complaint Submitted Successfully",

      complaint

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

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

    const complaints =

      await Complaint.find()

      .sort({

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
// DEPARTMENT COMPLAINTS
// HOD
// =====================================

exports.getDepartmentComplaints =
async (req, res) => {

  try {

    const { department } =
      req.params;

    const complaints =

      await Complaint.find({

        department

      })

      .sort({

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

exports.updateComplaintStatus =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const {

      status,
      reply

    } = req.body;

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

    res.status(200).json({

      success: true,

      message:
        "Complaint Updated Successfully",

      complaint

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};