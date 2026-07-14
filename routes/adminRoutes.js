const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/create-admin", async (req, res) => {

  try {

    const {
      username,
      name,
      password,
      role,
      department
    } = req.body;

    // Check Existing User
    const existingUser = await User.findOne({
      username
    });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists"
      });

    }

    console.log("RAW PASSWORD:", password);
    console.log("PASSWORD LENGTH:", password.length);

    // Hash Password Properly
    const salt = await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({

      username,
      name,
      password: hashedPassword,
      role,
      department

    });

    res.status(201).json({

      success: true,
      message: "Admin Created Successfully",
      user

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

module.exports = router;