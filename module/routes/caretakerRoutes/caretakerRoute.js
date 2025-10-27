import express from "express";
import { addCaretaker,
      signupCaretaker,
  caretakerLogin,
  verifyCaretakerOTP,
  caretakerProfile,
  resendCaretakerOTPforLogin,
  resendCaretakerOTPforSignup,
  caretakerLogout, getAllCaretakersByAdmin } from "../../controllers/caretakerController/caretakerController.js";
import { verifyAccessToken } from "../../../helpers/jwt.js"; // token verify middleware
import upload from "../../../config/multer.js";
const router = express.Router();

// Add caretaker (Admin or open based on your requirement)
// Agar sirf admin hi add kar sakta hai, use verifyAccessToken middleware
router.post("/add", verifyAccessToken,upload.none(), addCaretaker);

// Get all caretakers (Admin only)
router.get("/get-all", verifyAccessToken, getAllCaretakersByAdmin);


// 🔹 Signup (new caretaker registration + send OTP)
router.post("/signup",upload.none(), signupCaretaker);

// 🔹 Login (existing caretaker login + send OTP)
router.post("/login",upload.none(), caretakerLogin);

// 🔹 Verify OTP (for both signup & login)
router.post("/verify-otp",upload.none(), verifyCaretakerOTP);

// 🔹 Get caretaker profile (JWT token required)
router.get("/profile", verifyAccessToken, caretakerProfile);

// 🔹 Logout caretaker (JWT token required)
router.post("/logout", verifyAccessToken,upload.none(), caretakerLogout);

// 🔹 Resend OTP for Login
router.post("/resend-otp-login",upload.none(), resendCaretakerOTPforLogin);

// 🔹 Resend OTP for Signup
router.post("/resend-otp-signup",upload.none(), resendCaretakerOTPforSignup);

export default router;
