const router =
require("express").Router();

const upload =
require("../middleware/uploadMiddleware");

const authMiddleware =
require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

const {

  uploadImage,
  getImages,
  getDepartmentImages,
  deleteImage

} = require(
  "../controllers/galleryController"
);

// =========================
// UPLOAD IMAGES
// HOD / PRINCIPAL / TEACHER
// =========================

router.post(
  "/",

  authMiddleware,

  roleMiddleware(
    "HOD",
    "PRINCIPAL",
    "TEACHER"
  ),

  upload.array("files", 5),

  uploadImage
);

// =========================
// GET ALL IMAGES
// =========================

router.get("/",
  getImages
);

// =========================
// DEPARTMENT IMAGES
// =========================

router.get("/:department",
  getDepartmentImages,deleteImage
);

// DELETE IMAGE

router.delete(

  "/:id",

  authMiddleware,

  roleMiddleware(
    "HOD",
    "PRINCIPAL"
  ),

  deleteImage

);

module.exports = router;