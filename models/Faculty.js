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
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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

    mustChangePassword: {
      type: Boolean,
      default: false,
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