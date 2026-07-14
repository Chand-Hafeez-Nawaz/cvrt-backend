const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

  rollNumber: String,

  username: String,

  name: String,

  password: String,

  role: String,

  department: String,

  course: String

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);