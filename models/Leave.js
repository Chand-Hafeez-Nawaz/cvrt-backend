const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },

    facultyName: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    leaveType: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING_HOD",
        "HOD_APPROVED",
        "HOD_REJECTED",
        "PENDING_PRINCIPAL",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING_HOD",
    },

    hodActionBy: {
      type: String,
      default: "",
    },

    hodActionAt: {
      type: Date,
      default: null,
    },

    principalActionBy: {
      type: String,
      default: "",
    },

    principalActionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Leave",
  leaveSchema
);