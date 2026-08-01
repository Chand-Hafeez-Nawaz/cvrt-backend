const Faculty =
require("../models/Faculty");

const bcrypt =
require("bcryptjs");

// =====================================
// REGISTER FACULTY
// =====================================

exports.registerFaculty =
async (req, res) => {

  try {

    const {
      name,
      phone,
      email,
      password,
      designation,
      department,
      createdBy,
    } = req.body;

    const existingFaculty =
      await Faculty.findOne({
        phone,
      });

    if (existingFaculty) {

      return res.status(400).json({

        success: false,

        message:
          "Faculty already exists",

      });

    }

    const existingEmail =
  await Faculty.findOne({
    email,
  });

  if (existingEmail) {

    return res.status(400).json({

      success: false,

      message: "Email already registered",

    });

  }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const faculty =
      await Faculty.create({

        name,

        phone,

        email,

        password:
          hashedPassword,

        designation,

        department,

        createdBy,

      });

    res.status(201).json({

      success: true,

      message:
        "Faculty Registered Successfully",

      faculty,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};

// =====================================
// GET FACULTY
// =====================================

exports.getFaculty =
async (req, res) => {

  try {

    const { department } =
      req.params;

    let departments = [department];

// CSE and AIML share faculty
if (department === "CSE") {
  departments.push("AIML");
}

if (department === "AIML") {
  departments.push("CSE");
}

const faculty = await Faculty.find({
  department: { $in: departments }
}).select("-password");

    res.status(200).json({

      success: true,

      faculty,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};

// =====================================
// DELETE FACULTY
// =====================================

exports.deleteFaculty =
async (req, res) => {

  try {

    const { id } =
      req.params;

    await Faculty.findByIdAndDelete(
      id
    );

    res.status(200).json({

      success: true,

      message:
        "Faculty Deleted Successfully",

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};