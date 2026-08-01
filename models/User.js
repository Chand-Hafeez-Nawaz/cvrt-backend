const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  rollNumber: String,

  username: String,

  name: String,

  email: {
    type: String,
    required:true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: String,

  role: String,

  department: String,

  course: String,

  mustChangePassword: {
    type: Boolean,
    default: false,
  }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);