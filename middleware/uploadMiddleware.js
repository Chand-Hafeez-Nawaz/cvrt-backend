const multer = require("multer");

const {
  CloudinaryStorage,
} = require("multer-storage-cloudinary");

const cloudinary =
require("../config/cloudinary");

// =========================
// CLOUDINARY STORAGE
// =========================

const storage =
new CloudinaryStorage({

  cloudinary,

  params: async (req, file) => {

    // =====================
    // IMAGE FILES
    // =====================

    if (
      file.mimetype.startsWith("image/")
    ) {

      return {

        folder: "cvrt_gallery",

        resource_type: "image",

      };

    }

    // =====================
    // PDF / DOC / DOCX
    // =====================

    return {
  folder: "cvrt_notices",
  resource_type: "auto",
  public_id: `${Date.now()}-${file.originalname
  .replace(/\s+/g, "-")
  .replace(/[^\w.-]/g, "")}`,
};

  },

});

// =========================
// MULTER
// =========================

const upload = multer({

  storage,

});

module.exports = upload;