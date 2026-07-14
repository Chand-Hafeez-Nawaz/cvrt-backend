const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Faculty = require("../models/Faculty");

module.exports = async (req, res, next) => {

  try {

    // =========================
    // GET TOKEN
    // =========================

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        message: "No Token Provided"
      });

    }

    // =========================
    // EXTRACT TOKEN
    // =========================

    const token =
      authHeader.split(" ")[1];

    // =========================
    // VERIFY TOKEN
    // =========================

    const decoded = jwt.verify(

      token,
      process.env.JWT_SECRET

    );

    console.log("Decoded Token:", decoded);

    // =========================
    // FIND USER
    // =========================

    let user = await User.findById(
  decoded.id
).select("-password");

console.log("User Found:", user);

if (!user) {

  user = await Faculty.findById(
    decoded.id
  ).select("-password");

  console.log("Faculty Found:", user);

}

if (!user) {

  return res.status(404).json({
    message: "User Not Found"
  });

}

req.user = user;

next();

  } catch (error) {

    console.log(error);

    res.status(401).json({
      message: "Invalid Token"
    });

  }

};