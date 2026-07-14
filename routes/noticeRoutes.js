const router = require("express").Router();

const upload =
require("../middleware/uploadMiddleware");

const authMiddleware =
require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

const {

  createNotice,
  getNotices,
  getDepartmentNotices,
  getVisibleNotices,
  deleteNotice,
  updateNotice

} = require("../controllers/noticeController");

// ======================================
// CREATE NOTICE
// HOD / PRINCIPAL / FACULTY
// ======================================

router.post(

  "/",

  authMiddleware,

  roleMiddleware(

    "HOD",
    "PRINCIPAL",
    "FACULTY"

  ),

  upload.single("file"),

  createNotice

);

// ======================================
// GET ALL NOTICES
// ======================================

router.get(
  "/",
  getNotices
);

// ======================================
// GET VISIBLE NOTICES
// ======================================

router.post(

  "/visible",

  authMiddleware,

  getVisibleNotices

);

// ======================================
// GET DEPARTMENT NOTICES
// ======================================

router.get(
  "/department/:department",
  getDepartmentNotices
);

// ======================================
// DELETE NOTICE
// ======================================

router.delete(

  "/:id",

  authMiddleware,

  roleMiddleware(

    "HOD",
    "PRINCIPAL",
    "FACULTY"

  ),

  deleteNotice

);

// ======================================
// UPDATE NOTICE
// ======================================

router.put(

  "/:id",

  authMiddleware,

  roleMiddleware(

    "HOD",
    "PRINCIPAL",
    "FACULTY"

  ),

  upload.single("file"),

  updateNotice

);

module.exports = router;