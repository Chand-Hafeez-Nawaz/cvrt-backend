const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");
// ======================================
// REGISTER
// ======================================

exports.register = async (req, res) => {

  try {

    let {
      rollNumber,
      name,
      password,
      secretCode,
      department
    } = req.body;

    // =========================
    // SECRET CODE VALIDATION
    // =========================

    if (secretCode !== process.env.SECRET_CODE) {

      return res.status(403).json({
        message: "Invalid Secret Code"
      });

    }

    let course = "";

    // =========================
    // BTECH VALIDATION
    // =========================

    if (
      /^\d{2}9B1A(01|02|03|04|05|39)[A-Z0-9]+$/i.test(
        rollNumber
      )
    ) {

      course = "BTECH";

    }

    // =========================
    // DIPLOMA VALIDATION
    // =========================

    else if (
      /^\d{5}-(CM|C|EC|EE|M)-\d{3}$/i.test(
        rollNumber
      )
    ) {

      course = "DIPLOMA";

      const deptCode = rollNumber
        .split("-")[1]
        .toUpperCase();

      const deptMap = {

        CM: "CSE",
        C: "CIVIL",
        EC: "ECE",
        EE: "EEE",
        M: "MECH"

      };

      department = deptMap[deptCode];

    }

    else {

      return res.status(400).json({
        message: "Invalid Roll Number"
      });

    }

    // =========================
    // CHECK EXISTING USER
    // =========================

    const existingUser = await User.findOne({
      rollNumber
    });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists"
      });

    }

    // =========================
    // HASH PASSWORD
    // =========================

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // =========================
    // CREATE USER
    // =========================

    const user = await User.create({

      rollNumber,
      name,
      password: hashedPassword,
      role: "STUDENT",
      department,
      course

    });

    // =========================
    // SAFE RESPONSE
    // =========================

    const userData = {

      _id: user._id,
      rollNumber: user.rollNumber,
      username: user.username,
      name: user.name,
      role: user.role,
      department: user.department,
      course: user.course

    };

    res.status(201).json({

      success: true,
      message: "Registration Successful",
      user: userData

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

// ======================================
// LOGIN
// ======================================

exports.login = async (req, res) => {

  try {

    const {
      rollNumber,
      username,
      phone,
      password
    } = req.body;

    let user;

    // =========================
// LOGIN USING USERNAME
// (HOD / PRINCIPAL)
// =========================

if (username) {

  user = await User.findOne({
    username: username
  });

}

// =========================
// LOGIN USING FACULTY PHONE
// =========================

else if (phone) {

  user = await Faculty.findOne({
    phone: phone
  });

}

// =========================
// LOGIN USING ROLL NUMBER
// (STUDENT)
// =========================

else if (rollNumber) {

  user = await User.findOne({
    rollNumber: rollNumber
  });

}

    // =========================
    // USER NOT FOUND
    // =========================

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    // =========================
    // DEBUG LOGS
    // =========================

    console.log("Entered Password:", password);
    console.log("Stored Password:", user.password);

    // =========================
    // PASSWORD CHECK
    // =========================

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password Match:", isMatch);

    if (!isMatch) {

      return res.status(401).json({
        message: "Invalid Password"
      });

    }

    // =========================
    // JWT TOKEN
    // =========================

    const jwt = require("jsonwebtoken");

    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d"
      }

    );

    // =========================
    // SAFE RESPONSE
    // =========================

    const userData = {

  _id: user._id,
  rollNumber: user.rollNumber || null,
  username: user.username || null,
  phone: user.phone || null,
  name: user.name,
  role: user.role,
  department: user.department,
  course: user.course || null,
  designation: user.designation || null

};

    res.status(200).json({

      success: true,
      message: "Login Successful",
      token,
      user: userData

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};