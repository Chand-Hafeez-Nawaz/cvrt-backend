const router =
require("express").Router();

const {

  registerFaculty,

  getFaculty,

  deleteFaculty,

} = require(
  "../controllers/facultyController"
);

// Register Faculty
router.post(
  "/register",
  registerFaculty
);

// View Faculty By Department
router.get(
  "/:department",
  getFaculty
);

// Delete Faculty
router.delete(
  "/:id",
  deleteFaculty
);

module.exports = router;