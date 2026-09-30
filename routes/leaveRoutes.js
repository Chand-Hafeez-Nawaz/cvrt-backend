const router = require("express").Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  applyLeave,
  getMyLeaves,
  getHODLeaves,
  approveByHOD,
  rejectByHOD,
  getPrincipalLeaves,
  approveByPrincipal,
  rejectByPrincipal,
} = require("../controllers/leaveController");

// =====================================
// FACULTY
// =====================================

// Apply for leave
router.post(
  "/apply",
  authMiddleware,
  applyLeave
);

// View my leaves
router.get(
  "/my",
  authMiddleware,
  getMyLeaves
);


// =====================================
// HOD
// =====================================

// View pending leave requests
router.get(
  "/hod",
  authMiddleware,
  getHODLeaves
);

// Approve leave
router.put(
  "/hod/approve/:id",
  authMiddleware,
  approveByHOD
);

// Reject leave
router.put(
  "/hod/reject/:id",
  authMiddleware,
  rejectByHOD
);


// =====================================
// PRINCIPAL
// =====================================

// View HOD-approved/pending requests
router.get(
  "/principal",
  authMiddleware,
  getPrincipalLeaves
);

// Approve leave
router.put(
  "/principal/approve/:id",
  authMiddleware,
  approveByPrincipal
);

// Reject leave
router.put(
  "/principal/reject/:id",
  authMiddleware,
  rejectByPrincipal
);


module.exports = router;