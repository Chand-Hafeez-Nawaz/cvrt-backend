const router = require("express").Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  applyLeave,
  getMyLeaves,
  updateMyLeave,
  deleteMyLeave,

  getHODLeaves,
  getHODLeaveHistory,
  approveByHOD,
  rejectByHOD,

  getPrincipalLeaves,
  getPrincipalLeaveHistory,
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

// Edit my pending leave
router.put(
  "/:id",
  authMiddleware,
  updateMyLeave
);

// Delete my pending leave
router.delete(
  "/:id",
  authMiddleware,
  deleteMyLeave
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

// View HOD leave history
router.get(
  "/hod/history",
  authMiddleware,
  getHODLeaveHistory
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

// View Principal leave history
router.get(
  "/principal/history",
  authMiddleware,
  getPrincipalLeaveHistory
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