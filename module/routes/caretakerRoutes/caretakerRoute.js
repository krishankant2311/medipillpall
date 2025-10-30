import express from "express";
import { addCaretaker,
      signupCaretaker,
  caretakerLogin,
  verifyCaretakerOTP,
  caretakerProfile,
  resendCaretakerOTPforLogin,
  resendCaretakerOTPforSignup,
  getAllMedicationsByCaretaker,
  getActiveMedicationsByPatient,
  getAllPatientsOfCaretaker,
  getPatientByCaretaker,
  getAllPatientTasksByCaretaker,
  getPatientPersonalContactByCaretaker,
  getSinglePatientTaskByCaretaker,
  getPatientRecordByCaretaker,
  addMedicationByCaretaker,
  getAllMealsByCaretakerForPatient,
  getActiveMedicationsByCaretakerForPatient,
  getMedicationsByCaretakerForPatient,
  getDiscontinuedMedicationsByCaretakerForPatient,
  getAllMedicationRemindersByCaretakerForPatient,

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

// ✅ Get All Medications assigned to patients of the Caretaker
router.get("/medications-byCaretaker", verifyAccessToken, getAllMedicationsByCaretaker);

// ✅ Get Active Medications of a Patient by Caretaker
router.get("/medications-byPatient/:patient_id", verifyAccessToken, getActiveMedicationsByPatient);
 
// ✅ Get All Patients assigned to the Caretaker
router.get("/patients-of-caretaker", verifyAccessToken, getAllPatientsOfCaretaker);

// ✅ Get Personal Contact of a Patient by Caretaker
router.get("/patient-personal-contact/:patient_id", verifyAccessToken, getPatientPersonalContactByCaretaker);

// ✅ Get Details of a Patient by Caretaker
router.get("/patient-details/:patient_id", verifyAccessToken, getPatientByCaretaker);

// ✅ Get All Tasks of a Patient by Caretaker
router.get("/patient-tasks/:patient_id", verifyAccessToken, getAllPatientTasksByCaretaker);

// ✅ Get Single Task of a Patient by Caretaker
router.get("/patient/:patient_id/task/:task_id", verifyAccessToken, getSinglePatientTaskByCaretaker);

// ✅ Get Patient Record by Caretaker
router.get("/patient-record/:patient_id", verifyAccessToken, getPatientRecordByCaretaker);
// ✅ Add Medication by Caretaker
router.post("/add-medication-by-caretaker/:patientId", verifyAccessToken, upload.none(), addMedicationByCaretaker);

// ✅ Get All Meals by Caretaker for Patient
router.get("/meals-by-caretaker/:patientId", verifyAccessToken, getAllMealsByCaretakerForPatient);
// ✅ Get Active Medications by Caretaker for Patient
router.get("/active-medications-by-caretaker/:patientId", verifyAccessToken, getActiveMedicationsByCaretakerForPatient);
// ✅ Get All Medications by Caretaker for Patient
router.get("/medications-by-caretaker/:patientId", verifyAccessToken, getMedicationsByCaretakerForPatient);
// ✅ Get Discontinued Medications by Caretaker for Patient
router.get("/discontinued-medications-by-caretaker/:patientId", verifyAccessToken, getDiscontinuedMedicationsByCaretakerForPatient);
// ✅ Get All Medication Reminders by Caretaker for Patient
router.get("/medication-reminders-by-caretaker/:patientId", verifyAccessToken, getAllMedicationRemindersByCaretakerForPatient);

export default router;
