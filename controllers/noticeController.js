const Notice = require("../models/Notice");
const User = require("../models/User");
const Faculty = require("../models/Faculty");
const sendNotification = require("../utils/sendNotification");

// ======================================
// CREATE NOTICE
// ======================================

exports.createNotice = async (req, res) => {

  console.log("CREATE NOTICE API HIT");

  try {

    const {
      title,
      description,
      department,
      noticeType,
      createdBy,
      role,
      priority,
      visibility,
      isPinned
    } = req.body;

    // =========================
    // FILE UPLOAD
    // =========================

    let fileUrl = "";

    if (req.file) {
      fileUrl = req.file.path;
    }

    // ======================================
// ONLY_HODS CAN ONLY BE CREATED BY PRINCIPAL
// ======================================

if (
  visibility === "ONLY_HODS" &&
  req.user.role !== "PRINCIPAL"
) {

  return res.status(403).json({

    success: false,

    message:
      "Only Principal can create ONLY_HODS notices"

  });

}

    // =========================
    // CREATE NOTICE
    // =========================

    const notice = await Notice.create({

      title,

      description,

      department,

      noticeType,

      fileUrl,

      fileName:
        req.file?.originalname || "",

      createdBy,

      role,

      priority,

      visibility:
        visibility || "PUBLIC",

      isPinned:
        isPinned || false

    });

      const senderId = req.user.id;
      const senderRole = req.user.role;

    // =========================
    // SEND NOTIFICATION
    // =========================

    try {

      let users = [];
      let faculty = [];

      const finalVisibility =
        visibility || "PUBLIC";

      // =====================================
      // PUBLIC + ALL
      // =====================================

      if (
        finalVisibility === "PUBLIC" &&
        department === "ALL"
      ) {

        users = await User.find({

        _id: {
          $ne: senderRole === "FACULTY"
            ? null
            : senderId
        },

        expoPushToken: {
          $exists: true,
          $ne: null
        }

      }).select("expoPushToken role");

      faculty = await Faculty.find({

        _id: {
          $ne: senderRole === "FACULTY"
            ? senderId
            : null
        },

        expoPushToken: {
          $exists: true,
          $ne: null
        }

      }).select("expoPushToken");

      }

      // =====================================
      // PUBLIC + DEPARTMENT
      // =====================================

      else if (
        finalVisibility === "PUBLIC" &&
        department !== "ALL"
      ) {

        let departments = [department];

          if (department === "CSE") {
            departments.push("AIML");
          }

        users = await User.find({

          _id: {
            $ne: senderRole === "FACULTY"
              ? null
              : senderId
          },

          department: {
            $in: departments
          },

          expoPushToken: {
            $exists: true,
            $ne: null
          }

        }).select("expoPushToken role");

        faculty = await Faculty.find({

            _id: {
              $ne: senderRole === "FACULTY"
                ? senderId
                : null
            },

            department: {
              $in: departments
            },

            expoPushToken: {
              $exists: true,
              $ne: null
            }

          }).select("expoPushToken");

        }

      // =====================================
      // ONLY HODS + ALL
      // =====================================

      else if (
        finalVisibility === "ONLY_HODS" &&
        department === "ALL"
      ) {

        users = await User.find({

          role: "HOD",

          expoPushToken: {
            $exists: true,
            $ne: null
          }

        }).select("expoPushToken");

      }

      // =====================================
      // ONLY HODS + DEPARTMENT
      // =====================================

      else if (
        finalVisibility === "ONLY_HODS" &&
        department !== "ALL"
      ) {

        users = await User.find({

          role: "HOD",

          department,

          expoPushToken: {
            $exists: true,
            $ne: null
          }

        }).select("expoPushToken");

      }

      // =====================================
      // COLLECT TOKENS
      // =====================================

      const userTokens =
        users.map(
          user => user.expoPushToken
        );

      const facultyTokens =
        faculty.map(
          member => member.expoPushToken
        );

      const allTokens = [
        ...new Set([
          ...userTokens,
          ...facultyTokens
        ])
      ];
            // =====================================
      // SEND NOTIFICATION
      // =====================================

      if (allTokens.length > 0) {

        await sendNotification({

          expoPushTokens: allTokens,

          title:
            `📢 ${title}`,

          body:
            description ||
            "A new notice has been published.",

          data: {

            type: "NOTICE",

            noticeId:
              notice._id.toString(),

            department:
              department,

            noticeType:
              noticeType || "GENERAL"

          }

        });

      } else {

        console.log(
          "No users with push tokens found for this notice."
        );

      }

    } catch (notificationError) {

      // IMPORTANT:
      // Notification failure should NOT
      // make notice creation fail.

      console.log(
        "NOTICE NOTIFICATION ERROR:",
        notificationError
      );

    }

    // =========================
    // RESPONSE
    // =========================

    res.status(201).json({

      success: true,

      message:
        "Notice Created Successfully",

      notice

    });

  } catch (error) {

    console.log(
      "CREATE NOTICE ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};

// ======================================
// GET ALL NOTICES
// ======================================

exports.getNotices = async (req, res) => {

  try {

    const notices =
      await Notice.find()

      .sort({

        isPinned: -1,
        createdAt: -1

      });



    res.status(200).json({

      success: true,

      notices

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};

// ======================================
// GET VISIBLE NOTICES
// ======================================

exports.getVisibleNotices =
async (req, res) => {

  try {

    const {

      role,
      department

    } = req.body;

    let notices = [];

    // =====================================
    // PRINCIPAL
    // =====================================

    if (role === "PRINCIPAL") {

      notices =
        await Notice.find()

        .sort({

          isPinned: -1,
          createdAt: -1

        });

    }

    // =====================================
    // HOD
    // =====================================

    else if (role === "HOD") {

      notices =
        await Notice.find({

          $or: [

            // PUBLIC notices
            {
              visibility: "PUBLIC",
              department
            },

            // PUBLIC ALL notices
            {
              visibility: "PUBLIC",
              department: "ALL"
            },

            // ONLY HODS
            {
              visibility: "ONLY_HODS",
              department
            },

            // ONLY HODS ALL
            {
              visibility: "ONLY_HODS",
              department: "ALL"
            }

          ]

        })

        .sort({

          isPinned: -1,
          createdAt: -1

        });

    }

    // =====================================
// STUDENT / FACULTY
// =====================================

else {

  console.log("Role:", role);
  console.log("Department received:", department);

  let departments = [department];

  if (department === "AIML") {
    departments.push("CSE");
  }

  console.log("Searching departments:", departments);

  notices = await Notice.find({
    visibility: "PUBLIC",
    department: {
      $in: [...departments, "ALL"]
    }
  }).sort({
    isPinned: -1,
    createdAt: -1
  });

  console.log(
    "Notices found:",
    notices.map(n => ({
      title: n.title,
      department: n.department
    }))
  );
}

    res.status(200).json({

      success: true,

      notices

    });

  } catch (error) {

    console.log("VISIBLE NOTICE ERROR:", error);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};

// ======================================
// GET DEPARTMENT NOTICES
// ======================================

exports.getDepartmentNotices =
async (req, res) => {

  try {

    const { department } =
      req.params;

    let departments = [department];

// AIML students should also receive CSE notices
if (department === "AIML") {
  departments.push("CSE");
}

const notices = await Notice.find({
  visibility: "PUBLIC",
  department: {
    $in: [...departments, "ALL"]
  }
})
.sort({
  isPinned: -1,
  createdAt: -1
});

    res.status(200).json({

      success: true,

      notices

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};

// ======================================
// DELETE NOTICE
// ======================================

exports.deleteNotice =
async (req, res) => {

  try {

    const { id } =
      req.params;

    await Notice.findByIdAndDelete(id);

    res.status(200).json({

      success: true,

      message:
        "Notice Deleted Successfully"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

};

// ======================================
// UPDATE NOTICE
// ======================================

exports.updateNotice =
async (req, res) => {

  try {

    const { id } =
      req.params;

    console.log(
      "UPDATE BODY:",
      req.body
    );

    // =========================
    // UPDATE DATA
    // =========================

    const updatedData = {

      title:
        req.body.title,

      description:
        req.body.description,

      department:
        req.body.department,

      visibility:
        req.body.visibility,

      noticeType:
        req.body.noticeType,

      priority:
        req.body.priority,

    };

    // =========================
    // FILE UPDATE
    // =========================

    if (req.file) {

  updatedData.fileUrl =
    req.file.path;

  updatedData.fileName =
    req.file.originalname;

}

    // =========================
    // UPDATE NOTICE
    // =========================

    const updatedNotice =

      await Notice.findByIdAndUpdate(

        id,

        {
          $set: updatedData
        },

        {
          new: true,
        }

      );

    res.status(200).json({

      success: true,

      message:
        "Notice Updated Successfully",

      updatedNotice,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error",

    });

  }

};