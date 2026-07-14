const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      default: "Assistant Professor",
    },

    department: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "FACULTY",
    },

    createdBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Faculty",
  facultySchema
);