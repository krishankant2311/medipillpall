import express from "express";
import { addGuardian, getAllGuardiansByAdmin,signupGuardian ,getPatient,addPatient,getallPatientsbyGuardian, guardianLogin, verifyGuardianOTP, guardianProfile,editGuardianProfile } from "../../controllers/guardianController/guardianController.js";
import { verifyAccessToken } from "../../../helpers/jwt.js";
import upload from "../../../config/multer.js";
const router = express.Router();

router.post("/addGuardian",upload.none(), addGuardian);
router.get("/getAllGuardiansByAdmin", verifyAccessToken, getAllGuardiansByAdmin);

router.post("/signup-guardian",upload.none(), signupGuardian);

// Route 2: Guardian Login (send OTP)
router.post("/guardian-login",upload.none(), guardianLogin);

// Route 3: Verify Guardian OTP
router.post("/verify-guardian-otp",upload.none(), verifyGuardianOTP);

router.get("/guardian-profile", verifyAccessToken, guardianProfile);
router.put("/edit-guardian-profile", verifyAccessToken, upload.single('profileImage'), editGuardianProfile);

router.get("/getall-patients-byguardian", verifyAccessToken, getallPatientsbyGuardian);

router.get("/get-patient/:id", verifyAccessToken, getPatient);
router.post("/add-patient-byguardian", verifyAccessToken, upload.single('profileImage'), addPatient);

export default router;
