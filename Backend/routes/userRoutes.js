const express = require("express");
const {
    registerUser,
    loginUser,
    guestLogin,
    updateUserInfo,
    deleteUser,
    getUserInfo,
} = require("../controllers/userController");
const { validateToken } = require("../middleware/validateToken");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/guest", guestLogin);
router.put("/userinfo", validateToken, updateUserInfo);
router.delete("/userinfo", validateToken, deleteUser);
router.get("/userinfo", validateToken, getUserInfo);
module.exports = router;

