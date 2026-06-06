const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/register
router.post("/register", authController.register);

// GET /api/auth/verify
router.get("/verify", authController.verifyToken);

// POST /api/auth/send-code - 发送验证码
router.post("/send-code", authController.sendVerificationCode);

// POST /api/auth/reset-password - 重置密码
router.post("/reset-password", authController.resetPassword);

module.exports = router;
