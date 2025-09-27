// routes/adminRoutes.js

import express from "express";
import {
  adminLogin,
  logoutAdmin,
  changePassword,
  verifyOtp,
  adminForgotPassword,
  resendOTPForChangePassword,
  sendForgotPasswordOTP,
  changeForgotPassword,
} from "../controllers/adminController.js";

import { verifyAccessToken } from "../../helpers/jwt.js"; // token verify middleware

import upload from "../../config/multer.js";

const router = express.Router();

// 🔑 Auth routes
router.post("/login",upload.none(), adminLogin);
router.post("/logout", verifyAccessToken, logoutAdmin);
router.get("/test", (req, res) => {
  res.send("Admin routes working");
});
// 🔐 Password management
router.post("/change-password", verifyAccessToken,upload.none(), changePassword);

router.post("/forgot-password-ofadmin",upload.none(), adminForgotPassword);
router.post("/resend-otp",upload.none(), resendOTPForChangePassword);
router.post("/verify-otp", upload.none(),verifyOtp);
router.post("/change-forgot-password",upload.none(), changeForgotPassword);
router.post("/send-forgot-password-otp", upload.none(),sendForgotPasswordOTP);

export default router;
