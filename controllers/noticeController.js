const Notice = require("../models/Notice");

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

    res.status(201).json({

      success: true,

      message:
        "Notice Created Successfully",

      notice

    });

  } catch (error) {

    console.log("CREATE NOTICE ERROR:", error);

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