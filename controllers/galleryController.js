const Gallery = require("../models/Gallery");
const User = require("../models/User");
const Faculty = require("../models/Faculty");
const sendNotification = require("../utils/sendNotification");

// =====================================
// UPLOAD IMAGE
// =====================================

exports.uploadImage = async (req, res) => {

  try {

    const {
      title,
      department,
      uploadedBy
    } = req.body;

    let uploadedImages = [];

    // =========================
    // CLOUDINARY IMAGES
    // =========================

    if (req.files && req.files.length > 0) {

      uploadedImages = req.files.map(file => ({

        title,

        imageUrl:
          file.path,

        department,

        uploadedBy

      }));

    }

    // =========================
    // SAVE TO DB
    // =========================

    const images =
      await Gallery.insertMany(
        uploadedImages
      );

    // =====================================
// SEND GALLERY NOTIFICATION
// =====================================

try {

  let users = [];
  let faculty = [];

  const senderId =
    req.user.id;

  const senderRole =
    req.user.role;

  let departments = [department];

  // =====================================
  // CSE + AIML SHARE NOTIFICATIONS
  // =====================================

  if (department === "CSE") {
    departments.push("AIML");
  }

  if (department === "AIML") {
    departments.push("CSE");
  }

  // =====================================
  // FIND USERS
  // EXCLUDE SENDER IF USER COLLECTION
  // =====================================

  if (senderRole !== "FACULTY") {

    users = await User.find({

      _id: {
        $ne: senderId
      },

      department: {
        $in: departments
      },

      expoPushToken: {
        $exists: true,
        $ne: null
      }

    }).select("expoPushToken role");

  } else {

    users = await User.find({

      department: {
        $in: departments
      },

      expoPushToken: {
        $exists: true,
        $ne: null
      }

    }).select("expoPushToken role");

  }

  // =====================================
  // FIND FACULTY
  // EXCLUDE SENDER IF FACULTY
  // =====================================

  if (senderRole === "FACULTY") {

    faculty = await Faculty.find({

      _id: {
        $ne: senderId
      },

      department: {
        $in: departments
      },

      expoPushToken: {
        $exists: true,
        $ne: null
      }

    }).select("expoPushToken");

  } else {

    faculty = await Faculty.find({

      department: {
        $in: departments
      },

      expoPushToken: {
        $exists: true,
        $ne: null
      }

    }).select("expoPushToken");

  }

  // =====================================
  // COLLECT TOKENS
  // =====================================

  const userTokens =
    users.map(
      user => user.expoPushToken
    );

  const facultyTokens =
    faculty.map(
      member => member.expoPushToken
    );

  const allTokens = [
    ...userTokens,
    ...facultyTokens
  ];

  // =====================================
  // REMOVE DUPLICATES
  // =====================================

  const uniqueTokens =
    [...new Set(allTokens)];

  // =====================================
  // SEND NOTIFICATION
  // =====================================

  if (uniqueTokens.length > 0) {

    await sendNotification({

      expoPushTokens:
        uniqueTokens,

      title:
        "🖼️ New Gallery Update",

      body:
        `${images.length} new image${
          images.length > 1 ? "s" : ""
        } added to the ${department} Gallery.`,

      data: {

        type:
          "GALLERY",

        department,

        imageCount:
          images.length,

        galleryId:
          images[0]?._id?.toString() || ""

      }

    });

  } else {

    console.log(
      "No users with push tokens found for gallery notification."
    );

  }

} catch (notificationError) {

  console.log(
    "GALLERY NOTIFICATION ERROR:",
    notificationError
  );

}

    // =====================================
    // RESPONSE
    // =====================================

    res.status(201).json({

      success: true,

      message:
        "Images Uploaded Successfully",

      images

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};

// =====================================
// GET ALL IMAGES
// =====================================

exports.getImages = async (req, res) => {

  try {

    const images =
      await Gallery.find()
      .sort({ createdAt: -1 });

    res.status(200).json({

      success: true,
      images

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};

// =====================================
// DEPARTMENT GALLERY
// =====================================

exports.getDepartmentImages =
async (req, res) => {

  try {

    const { department } =
      req.params;

    const images =
      await Gallery.find({
        department
      }).sort({
        createdAt: -1
      });

    res.status(200).json({

      success: true,
      images

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};

// =====================================
// DELETE IMAGE
// =====================================

exports.deleteImage =
async (req, res) => {

  try {

    const { id } =
      req.params;

    await Gallery.findByIdAndDelete(id);

    res.status(200).json({

      success: true,

      message:
        "Image Deleted Successfully",

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        "Server Error"

    });

  }

};