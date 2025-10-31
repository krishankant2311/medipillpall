import { addPatient,
  login,
  editPatient,
  logoutPatient,
  deletePatient,
  adminLogin,
  getCurrentLanguage,
  changePatientLanguage,
  sendOTPbyNumber,
  verifyPatientOTP,
  getAllPatientsByAdmin,
  resendPatientOTPforLogin,
  resendPatientOTPforSignup,
  resendOTPbyNumber, } from "../controllers/patientController.js";  
import { verifyAccessToken } from "../../helpers/jwt.js"; 
import express from "express";
import upload from "../../config/multer.js"
const router = express.Router();

// 👇 Correct way
router.post("/add-patient", upload.none(), addPatient);
router.post("/login",upload.none(), login);

// 🟢 Edit Patient Profile (Protected)
router.post("/edit", verifyAccessToken,upload.none(), editPatient);

// 🟢 Logout Patient (Protected)
router.post("/logout", verifyAccessToken, logoutPatient);

// 🟢 Soft Delete Patient (Protected)
router.post("/delete", verifyAccessToken, deletePatient);

router.get("/all-patientByAdmin", verifyAccessToken, getAllPatientsByAdmin);
router.post("/send-otp", sendOTPbyNumber);

// 🟢 Resend OTP by Number (30 sec wait)
router.post("/resend-otp", resendOTPbyNumber);
router.post("/login-admin",upload.none(), adminLogin);

// GET current language
router.get("/language", verifyAccessToken, getCurrentLanguage);

router.post("/verify-otp", upload.none(), verifyPatientOTP);

// POST change language
router.post("/language", verifyAccessToken, changePatientLanguage);

router.post("/resend-otp-login", upload.none(), resendPatientOTPforLogin);
router.post("/resend-otp-signup", upload.none(), resendPatientOTPforSignup);

export default router;
