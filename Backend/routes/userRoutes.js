const express = require("express");
const {
    registerUser,
    loginUser,
    guestLogin,
    requestVerification,
    verifyEmail,
    updateUserInfo,
    deleteUser,
} = require("../controllers/userController");
const { validateToken } = require("../middleware/validateToken");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/guest", guestLogin);
router.get("/verify/request", validateToken, requestVerification);
router.post("/verify", verifyEmail);
router.put("/userinfo", validateToken, updateUserInfo);
router.delete("/userinfo", validateToken, deleteUser);

module.exports = router;
