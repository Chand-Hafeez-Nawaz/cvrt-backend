const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({

  // =========================
  // TITLE
  // =========================

  title: {

    type: String,

    required: true

  },

  // =========================
  // DESCRIPTION
  // =========================

  description: {

    type: String,

    required: true

  },

  // =========================
  // DEPARTMENT
  // =========================

  department: {

    type: String,

    default: "ALL"

  },

  // =========================
  // NOTICE TYPE
  // =========================

  noticeType: {

    type: String,

    enum: [

      "GENERAL",
      "EVENT",
      "EXAM",
      "PLACEMENT",
      "URGENT"

    ],

    default: "GENERAL"

  },

  // =========================
  // FILE URL
  // =========================

  fileUrl: {

    type: String,

    default: ""

  },

  fileName: {
  type: String,
  default: "",
  },

  // =========================
  // CREATED BY
  // =========================

  createdBy: {

    type: String,

    required: true

  },

  // =========================
  // ROLE
  // =========================

  role: {

    type: String,

    enum: [

      "PRINCIPAL",
      "HOD",
      "FACULTY"

    ],

    required: true

  },

  // =========================
  // PRIORITY
  // =========================

  priority: {

    type: String,

    enum: [

      "LOW",
      "MEDIUM",
      "HIGH"

    ],

    default: "LOW"

  },

  // =========================
  // VISIBILITY
  // =========================

  visibility: {

    type: String,

    enum: [

      "PUBLIC",
      "ONLY_HODS"

    ],

    default: "PUBLIC"

  },

  // =========================
  // PIN NOTICE
  // =========================

  isPinned: {

    type: Boolean,

    default: false

  }

}, {

  timestamps: true

});

module.exports = mongoose.model(

  "Notice",

  NoticeSchema

);