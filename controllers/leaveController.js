const Leave = require("../models/Leave");

// =====================================
// APPLY FOR LEAVE
// FACULTY ONLY
// =====================================

exports.applyLeave = async (req, res) => {
  try {

    // Only Faculty can apply for leave
    if (req.user.role !== "FACULTY") {

      return res.status(403).json({
        success: false,
        message: "Only faculty can apply for leave",
      });

    }

    const {
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (
      !leaveType ||
      !startDate ||
      !endDate ||
      !reason
    ) {

      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });

    }

    // =========================
    // DATE VALIDATION
    // =========================

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });

    }

    if (end < start) {

      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date",
      });

    }

    // =========================
    // CREATE LEAVE
    // =========================

    const leave = await Leave.create({

      facultyId: req.user._id,

      facultyName: req.user.name,

      department: req.user.department,

      leaveType,

      startDate: start,

      endDate: end,

      reason,

      status: "PENDING_HOD",

    });

    res.status(201).json({

      success: true,

      message:
        "Leave request submitted successfully",

      leave,

    });

  } catch (error) {

    console.log(
      "APPLY LEAVE ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }
};


// =====================================
// FACULTY - VIEW MY LEAVES
// =====================================

exports.getMyLeaves = async (req, res) => {

  try {

    if (req.user.role !== "FACULTY") {

      return res.status(403).json({

        success: false,

        message:
          "Only faculty can view their leaves",

      });

    }

    const leaves =
      await Leave.find({

        facultyId: req.user._id,

      }).sort({

        createdAt: -1,

      });

    res.status(200).json({

      success: true,

      leaves,

    });

  } catch (error) {

    console.log(
      "MY LEAVES ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};


// =====================================
// HOD - VIEW PENDING LEAVES
// =====================================

exports.getHODLeaves = async (req, res) => {

  try {

    if (req.user.role !== "HOD") {

      return res.status(403).json({

        success: false,

        message:
          "Only HOD can access this",

      });

    }

    const leaves =
      await Leave.find({

        department:
          req.user.department,

        status:
          "PENDING_HOD",

      }).sort({

        createdAt: -1,

      });

    res.status(200).json({

      success: true,

      leaves,

    });

  } catch (error) {

    console.log(
      "HOD LEAVES ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};


// =====================================
// HOD - APPROVE LEAVE
// =====================================

exports.approveByHOD = async (req, res) => {

  try {

    if (req.user.role !== "HOD") {

      return res.status(403).json({

        success: false,

        message:
          "Only HOD can approve leave",

      });

    }

    const { id } = req.params;

    const leave =
      await Leave.findById(id);

    if (!leave) {

      return res.status(404).json({

        success: false,

        message: "Leave request not found",

      });

    }

    // =========================
    // DEPARTMENT SECURITY
    // =========================

    if (
      leave.department !==
      req.user.department
    ) {

      return res.status(403).json({

        success: false,

        message:
          "You cannot access this leave request",

      });

    }

    // =========================
    // STATUS SECURITY
    // =========================

    if (
      leave.status !==
      "PENDING_HOD"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "This leave is not pending HOD approval",

      });

    }

    leave.status =
      "PENDING_PRINCIPAL";

    leave.hodActionBy =
      req.user.name;

    leave.hodActionAt =
      new Date();

    await leave.save();

    res.status(200).json({

      success: true,

      message:
        "Leave approved by HOD and sent to Principal",

      leave,

    });

  } catch (error) {

    console.log(
      "HOD APPROVE ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};


// =====================================
// HOD - REJECT LEAVE
// =====================================

exports.rejectByHOD = async (req, res) => {

  try {

    if (req.user.role !== "HOD") {

      return res.status(403).json({

        success: false,

        message:
          "Only HOD can reject leave",

      });

    }

    const { id } = req.params;

    const leave =
      await Leave.findById(id);

    if (!leave) {

      return res.status(404).json({

        success: false,

        message: "Leave request not found",

      });

    }

    // Department security
    if (
      leave.department !==
      req.user.department
    ) {

      return res.status(403).json({

        success: false,

        message:
          "You cannot access this leave request",

      });

    }

    if (
      leave.status !==
      "PENDING_HOD"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "This leave is not pending HOD approval",

      });

    }

    leave.status =
      "HOD_REJECTED";

    leave.hodActionBy =
      req.user.name;

    leave.hodActionAt =
      new Date();

    await leave.save();

    res.status(200).json({

      success: true,

      message:
        "Leave rejected by HOD",

      leave,

    });

  } catch (error) {

    console.log(
      "HOD REJECT ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};


// =====================================
// PRINCIPAL - VIEW PENDING LEAVES
// =====================================

exports.getPrincipalLeaves =
async (req, res) => {

  try {

    if (
      req.user.role !==
      "PRINCIPAL"
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Only Principal can access this",

      });

    }

    const leaves =
      await Leave.find({

        status:
          "PENDING_PRINCIPAL",

      }).sort({

        createdAt: -1,

      });

    res.status(200).json({

      success: true,

      leaves,

    });

  } catch (error) {

    console.log(
      "PRINCIPAL LEAVES ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};


// =====================================
// PRINCIPAL - APPROVE LEAVE
// =====================================

exports.approveByPrincipal =
async (req, res) => {

  try {

    if (
      req.user.role !==
      "PRINCIPAL"
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Only Principal can approve leave",

      });

    }

    const { id } = req.params;

    const leave =
      await Leave.findById(id);

    if (!leave) {

      return res.status(404).json({

        success: false,

        message:
          "Leave request not found",

      });

    }

    if (
      leave.status !==
      "PENDING_PRINCIPAL"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "This leave is not pending Principal approval",

      });

    }

    leave.status =
      "APPROVED";

    leave.principalActionBy =
      req.user.name;

    leave.principalActionAt =
      new Date();

    await leave.save();

    res.status(200).json({

      success: true,

      message:
        "Leave approved. Leave granted.",

      leave,

    });

  } catch (error) {

    console.log(
      "PRINCIPAL APPROVE ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};


// =====================================
// PRINCIPAL - REJECT LEAVE
// =====================================

exports.rejectByPrincipal =
async (req, res) => {

  try {

    if (
      req.user.role !==
      "PRINCIPAL"
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Only Principal can reject leave",

      });

    }

    const { id } = req.params;

    const leave =
      await Leave.findById(id);

    if (!leave) {

      return res.status(404).json({

        success: false,

        message:
          "Leave request not found",

      });

    }

    if (
      leave.status !==
      "PENDING_PRINCIPAL"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "This leave is not pending Principal approval",

      });

    }

    leave.status =
      "REJECTED";

    leave.principalActionBy =
      req.user.name;

    leave.principalActionAt =
      new Date();

    await leave.save();

    res.status(200).json({

      success: true,

      message:
        "Leave rejected by Principal",

      leave,

    });

  } catch (error) {

    console.log(
      "PRINCIPAL REJECT ERROR:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Server Error",

    });

  }

};