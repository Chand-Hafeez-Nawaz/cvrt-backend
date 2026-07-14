const Gallery = require("../models/Gallery");

// Upload Image
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

    res.status(201).json({

      success: true,

      message:
        "Images Uploaded Successfully",

      images

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message: "Server Error"

    });

  }

};

// Get All Images
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
      message: "Server Error"
    });

  }

};

// Department Gallery
exports.getDepartmentImages =
async (req, res) => {

  try {

    const { department } =
      req.params;

    const images =
      await Gallery.find({
        department
      }).sort({ createdAt: -1 });

    res.status(200).json({

      success: true,
      images

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error"
    });

  }

};

// DELETE IMAGE

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

      message: "Server Error"

    });

  }

};