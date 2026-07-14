const mongoose = require("mongoose");

const ComplaintSchema =
new mongoose.Schema({

  // =====================
  // STUDENT DETAILS
  // =====================

  studentName: {

    type: String,

    required: true

  },

  rollNumber: {

    type: String,

    required: true

  },

  department: {

    type: String,

    required: true

  },

  // =====================
  // CATEGORY
  // =====================

  category: {

    type: String,

    enum: [

      "ACADEMIC",

      "LAB",

      "TRANSPORT",

      "HOSTEL",

      "INFRASTRUCTURE",

      "OTHER"

    ],

    default: "OTHER"

  },

  // =====================
  // COMPLAINT
  // =====================

  complaintText: {

    type: String,

    required: true

  },

  // =====================
  // FILE / IMAGE
  // =====================

  fileUrl: {

    type: String,

    default: ""

  },

  // =====================
  // STATUS
  // =====================

  status: {

    type: String,

    enum: [

      "PENDING",

      "IN_PROGRESS",

      "RESOLVED",

      "REJECTED"

    ],

    default: "PENDING"

  },

  // =====================
  // HOD / PRINCIPAL REPLY
  // =====================

  reply: {

    type: String,

    default: ""

  }

}, {

  timestamps: true

});

module.exports =

mongoose.model(

  "Complaint",

  ComplaintSchema

);