const router =
require("express").Router();

const upload =
require("../middleware/uploadMiddleware");

const authMiddleware =
require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

const {

  submitComplaint,
  getComplaints,
  getDepartmentComplaints,
  updateComplaintStatus,
  getStudentComplaints

} = require(
  "../controllers/complaintController"
);

// =====================================
// SUBMIT COMPLAINT
// STUDENT
// =====================================

router.post(

  "/",

  authMiddleware,

  roleMiddleware(
    "STUDENT"
  ),

  (req, res, next) => {

    const contentType =
      req.headers["content-type"] || "";

    // =====================
    // ONLY USE MULTER
    // FOR FORMDATA
    // =====================

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {

      upload.single("file")(
        req,
        res,
        next
      );

    } else {

      next();

    }

  },

  submitComplaint

);

// =====================================
// GET ALL COMPLAINTS
// PRINCIPAL
// =====================================

router.get(

  "/",

  authMiddleware,

  roleMiddleware(
    "PRINCIPAL"
  ),

  getComplaints

);


// =========================
// STUDENT COMPLAINTS
// =========================

router.get(

  "/student/:rollNumber",

  authMiddleware,

  roleMiddleware(
    "STUDENT"
  ),

  getStudentComplaints

);

// =====================================
// GET DEPARTMENT COMPLAINTS
// HOD
// =====================================

router.get(

  "/department/:department",

  authMiddleware,

  roleMiddleware(
    "HOD"
  ),

  getDepartmentComplaints

);

// =====================================
// UPDATE STATUS
// HOD / PRINCIPAL
// =====================================

router.put(

  "/:id",

  authMiddleware,

  roleMiddleware(
    "HOD",
    "PRINCIPAL"
  ),

  updateComplaintStatus

);

module.exports = router;