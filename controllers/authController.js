const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");
const sendEmail = require("../utils/sendEmail");



// ======================================
// GENERATE TEMP PASSWORD
// ======================================

function generateTempPassword(length = 8) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
}

// ======================================
// REGISTER
// ======================================

exports.register = async (req, res) => {

  try {

    let {
      rollNumber,
      name,
      email,
      password,
      secretCode,
      department
    } = req.body;

    console.log("Request Body:", req.body);

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
      /^\d{2}(9B1A|9B5A)(01|02|03|04|05|39)[A-Z0-9]+$/i.test(
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


    const existingEmail = await User.findOne({
  email
  });

  if (existingEmail) {
     return res.status(400).json({
      message: "Email already registered"
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
      email,
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
      email: user.email,
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
// TEMP PASSWORD CHECK
// =========================

if (user.mustChangePassword) {

  return res.status(200).json({

    success: true,
    message: "Temporary password detected",
    mustChangePassword: true,

    user: {
      rollNumber: user.rollNumber || null,
      phone: user.phone || null,
      name: user.name,
      role: user.role,
    }

  });

}

console.log("mustChangePassword:", user.mustChangePassword);

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
  designation: user.designation || null,
  mustChangePassword: user.mustChangePassword || null

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

// ======================================
//FORGOT PASSWORD
// ======================================

exports.forgotPassword = async (req, res) => {
  try {

    const { rollNumber, phone, email } = req.body;

    let user;

    if (rollNumber) {
      user = await User.findOne({
        rollNumber,
        email
      });
    } 

    else if (phone) {
      console.log("Phone:", phone);
      console.log("Email:", email);
      user = await Faculty.findOne({
        phone,
        email
      });
      console.log("User Found:", user);
    } else {
      return res.status(400).json({
        success: false,
        message: "Roll Number or Phone is required"
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate temp password
    const tempPassword = generateTempPassword();

    user.password = await bcrypt.hash(tempPassword, 10);
    user.mustChangePassword = true;

    await user.save();

    console.log("Sending email to:", user.email);

    await sendEmail(
      user.email,
      user.name,
      "CVRT Portal - Password Reset",
      `
      <h2>CVRT Portal Password Reset</h2>
      <p>Hello <b>${user.name}</b>,</p>
      <p>Your temporary password is:</p>
      <h2>${tempPassword}</h2>
      <p>Please log in and change your password immediately.</p>
      `
    );

    console.log("Email sent successfully");
    return res.status(200).json({
      success: true,
      message: "Temporary password has been sent to your registered email."
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// ======================================
// CHANGE PASSWORD
// ======================================

exports.changePassword = async (req, res) => {

  try {

    const { rollNumber, phone, currentPassword, newPassword } = req.body;

    let user;

    // =========================
    // STUDENT
    // =========================

    if (rollNumber) {

      user = await User.findOne({ rollNumber });

    }

    // =========================
    // FACULTY
    // =========================

    else if (phone) {

      user = await Faculty.findOne({ phone });

    }

    // =========================
    // INVALID REQUEST
    // =========================

    else {

      return res.status(400).json({
        success: false,
        message: "Roll Number or Phone is required"
      });

    }

    // =========================
    // USER NOT FOUND
    // =========================

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    // =========================
    // CHECK CURRENT PASSWORD
    // =========================

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });

    }

    // =========================
    // UPDATE PASSWORD
    // =========================

    user.password = await bcrypt.hash(newPassword, 10);

    user.mustChangePassword = false;

    await user.save();

    return res.status(200).json({

      success: true,
      message: "Password changed successfully"

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,
      message: "Server Error"

    });

  }

};