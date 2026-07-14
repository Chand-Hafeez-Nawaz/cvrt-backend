const mongoose =
require("mongoose");

const bcrypt =
require("bcryptjs");

const User =
require("./models/User");

require("dotenv").config();

mongoose.connect(
  process.env.MONGO_URI
)
.then(() => {
  console.log("MongoDB Connected");
})
.catch(err => {
  console.log(err);
});

const seedAdmins = async () => {

  try {

    // Delete Existing Admins
    await User.deleteMany({
      role: {
        $in: [
          "PRINCIPAL",
          "HOD"
        ]
      }
    });

    // Hash Passwords
    const principalPassword =
      await bcrypt.hash(
        "principal123",
        10
      );

    const hodPassword =
      await bcrypt.hash(
        "hod123",
        10
      );

    // Principal Account
    const principal = {

      username: "principal",
      password: principalPassword,
      role: "PRINCIPAL",
      department: "ALL",
      course: "ADMIN"

    };

    // HOD Accounts
    const hods = [

      {
        username: "hod_cse",
        password: hodPassword,
        role: "HOD",
        department: "CSE",
        course: "ADMIN"
      },

      {
        username: "hod_ece",
        password: hodPassword,
        role: "HOD",
        department: "ECE",
        course: "ADMIN"
      },

      {
        username: "hod_eee",
        password: hodPassword,
        role: "HOD",
        department: "EEE",
        course: "ADMIN"
      },

      {
        username: "hod_civil",
        password: hodPassword,
        role: "HOD",
        department: "CIVIL",
        course: "ADMIN"
      },

      {
        username: "hod_mech",
        password: hodPassword,
        role: "HOD",
        department: "MECH",
        course: "ADMIN"
      }

    ];

    // Insert Principal
    await User.create(principal);

    // Insert HODs
    await User.insertMany(hods);

    console.log(
      "Principal & HOD Accounts Created"
    );

    process.exit();

  } catch (error) {

    console.log(error);

    process.exit();

  }

};

seedAdmins();