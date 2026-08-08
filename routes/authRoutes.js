
const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const { register, login, forgotPassword, changePassword, savePushToken } = require("../controllers/authController");


router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", changePassword);
router.put("/save-push-token", authMiddleware, savePushToken);

module.exports = router;
