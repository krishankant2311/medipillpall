import express from "express";
import { addGuardian, getAllGuardiansByAdmin,signupGuardian ,getPatientReportsByGuardian,
    getPatient,getAllCareNotesByGuardian,addPatient,getallPatientsbyGuardian,
     guardianLogin, verifyGuardianOTP,getAllMedsByGuardian,getMedsByGuardian,
      guardianProfile,getActivePatientsByGuardian,getAllCaregiversByGuardian,
      assignPatientToCaregiver,
      editGuardianProfile,logoutGuardian,resendGuardianOTPforLogin,resendGuardianOTPforSignup } from "../../controllers/guardianController/guardianController.js";
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
router.post("/edit-guardian-profile", verifyAccessToken, upload.single('profileImage'), editGuardianProfile);

router.get("/getall-patients-byguardian", verifyAccessToken, getallPatientsbyGuardian);

router.get("/get-patient/:id", verifyAccessToken, getPatient);
router.post("/add-patient-byguardian", verifyAccessToken, upload.single('profileImage'), addPatient);
router.get("/getall-carenotes-byguardian", verifyAccessToken, getAllCareNotesByGuardian);

router.get("/getall-meds-byguardian", verifyAccessToken, getAllMedsByGuardian);
router.get("/get-meds-byguardian/:id", verifyAccessToken, getMedsByGuardian);

router.get("/get-patient-reports-byguardian/:id", verifyAccessToken, getPatientReportsByGuardian);

router.get("/get-active-patients-byguardian", verifyAccessToken, getActivePatientsByGuardian);
router.get("/getall-caregivers-byguardian", verifyAccessToken, getAllCaregiversByGuardian);

router.post("/resend-guardian-otp",upload.none(), resendGuardianOTPforSignup);

router.post("/resend-guardian-otp-login",upload.none(), resendGuardianOTPforLogin);

router.post("/logout-guardian", verifyAccessToken,upload.none(), logoutGuardian);

router.post("/assign-patient-to-caretaker", verifyAccessToken, upload.none(), assignPatientToCaregiver);
export default router;
