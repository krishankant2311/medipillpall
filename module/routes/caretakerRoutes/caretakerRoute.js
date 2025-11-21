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
  getPatientBloodPressureByCaretaker,
  getPatientBloodSugarByCaretaker,
  getPatientBodyTempByCaretaker,
  getPatientBodyWeightByCaretaker,
  getPatientHeartRateByCaretaker,
  getPatientMedicalReportByCaretaker,
  getPatientPrescriptionByCaretaker,
  addPatientBodyTempByCaretaker,
  addPatientBodyWeightByCaretaker,
  addPatientHeartRateByCaretaker, 
  addPatientBloodSugarByCaretaker,
  addPatientBloodPressureByCaretaker,
  addPrescriptionByCaretaker,
  getPatientDailyRoutineByCaretaker,
  uploadMedicalReportByCaretaker,
  getAppLanguageByCaretaker,
  addPatientCareNotesByCaretaker,
  changeAppLanguageByCaretaker,
  getCareNotesByCaretaker,
  updateActivityTaskStatus,
  updateMealAndDietTaskStatus,
  updateNeedsTaskStatus,
  updateAppointmentTaskStatus,
  updateVisitorTaskStatus,
  editPatientBloodPressureByCaretaker,
  editPatientBodyTempByCaretaker,
  editPatientHeartRateByCaretaker,
  editPatientBodyWeightByCaretaker,
  editPatientBloodSugarByCaretaker,
  addActivityRemark,
  editActivityRemark,
  addVisitorRemark,
  editVisitorRemark,
  addNeedsRemark,
  editNeedsRemark,
  addAppointmentRemark,
  editAppointmentRemark,
  addMealRemark,
  editMealRemark,
  getAllCareNotesByCaretaker,deleteCaretakerByAdmin,getAllDailyCare,
  addReminderByCaretaker,editCaretakerProfile,getMedicalHistoryByCaretaker,
  getTermsAndConditionsByCaretaker,getPrivacyPolicyByCaretaker,getFaqByCaretaker,
  addPatientMealByCaretaker,addPatientDietByCaretaker,getPatientDietByCaretaker,getPatientMealByCaretaker,
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

// -------------------- GET BLOOD PRESSURE BY CARETAKER --------------------  
router.get("/patient-blood-pressure/:patientId", verifyAccessToken, getPatientBloodPressureByCaretaker);
// -------------------- GET BLOOD SUGAR BY CARETAKER --------------------
router.get("/patient-blood-sugar/:patientId", verifyAccessToken, getPatientBloodSugarByCaretaker);
// -------------------- GET BODY TEMPERATURE BY CARETAKER --------------------
router.get("/patient-body-temp/:patientId", verifyAccessToken, getPatientBodyTempByCaretaker);
// -------------------- GET BODY WEIGHT BY CARETAKER --------------------
router.get("/patient-body-weight/:patientId", verifyAccessToken, getPatientBodyWeightByCaretaker);
// -------------------- GET HEART RATE BY CARETAKER --------------------
router.get("/patient-heart-rate/:patientId", verifyAccessToken, getPatientHeartRateByCaretaker);

// -------------------- GET MEDICAL REPORT BY CARETAKER --------------------
router.get("/patient-medical-report/:patientId", verifyAccessToken, getPatientMedicalReportByCaretaker);

// -------------------- GET PRESCRIPTION BY CARETAKER --------------------
router.get("/patient-prescription/:patientId", verifyAccessToken, getPatientPrescriptionByCaretaker);
// -------------------- ADD BODY TEMPERATURE BY CARETAKER --------------------
router.post("/add-patient-body-temp/:patientId", verifyAccessToken, upload.none(), addPatientBodyTempByCaretaker);
// -------------------- ADD BODY WEIGHT BY CARETAKER --------------------
router.post("/add-patient-body-weight/:patientId", verifyAccessToken, upload.none(), addPatientBodyWeightByCaretaker);
// -------------------- ADD HEART RATE BY CARETAKER --------------------
router.post("/add-patient-heart-rate/:patientId", verifyAccessToken, upload.none(), addPatientHeartRateByCaretaker);
// -------------------- ADD BLOOD SUGAR BY CARETAKER --------------------
router.post("/add-patient-blood-sugar/:patientId", verifyAccessToken, upload.none(), addPatientBloodSugarByCaretaker);
// -------------------- ADD BLOOD PRESSURE BY CARETAKER --------------------
router.post("/add-patient-blood-pressure/:patientId", verifyAccessToken, upload.none(), addPatientBloodPressureByCaretaker);
// -------------------- ADD PRESCRIPTION BY CARETAKER --------------------
router.post("/add-prescription/:patientId", verifyAccessToken, upload.single('prescriptionFile'), addPrescriptionByCaretaker);
// -------------------- UPLOAD MEDICAL REPORT BY CARETAKER --------------------
router.post("/upload-medical-report/:patientId", verifyAccessToken, upload.array("files", 5), uploadMedicalReportByCaretaker);
// -------------------- ADD REMINDER BY CARETAKER --------------------
router.post("/add-reminder/:patientId", verifyAccessToken, upload.none(), addReminderByCaretaker);

router.post("/edit-caretaker-profile", verifyAccessToken, upload.single('profilePhoto'), editCaretakerProfile);

router.post("/add-PatientMeal-ByCaretaker", verifyAccessToken,upload.none(),addPatientMealByCaretaker)
router.get("/get-medical-history-by-caretaker/:patientId", verifyAccessToken, getMedicalHistoryByCaretaker);
router.post("/add-Patient-Diet-ByCaretaker",verifyAccessToken,upload.none(),addPatientDietByCaretaker)
router.get("/terms-and-conditions", verifyAccessToken, getTermsAndConditionsByCaretaker);
router.get("/privacy-policy", verifyAccessToken, getPrivacyPolicyByCaretaker);
router.get("/faq", verifyAccessToken, getFaqByCaretaker);

router.get("/get-patient-diet-by-caretaker/:patientId", verifyAccessToken, getPatientDietByCaretaker);
router.get("/get-patient-meal-by-caretaker/:patientId", verifyAccessToken, getPatientMealByCaretaker);

router.get("/get-patient-daily-routine-by-caretaker/:patientId", verifyAccessToken, getPatientDailyRoutineByCaretaker);

router.get("/get-app-language-by-caretaker", verifyAccessToken, getAppLanguageByCaretaker);
router.post("/change-app-language-by-caretaker", verifyAccessToken, upload.none(), changeAppLanguageByCaretaker);

router.post("/add-patient-carenotes-by-caretaker/:patientId", verifyAccessToken, upload.none(), addPatientCareNotesByCaretaker);
router.get("/get-patient-carenotes-by-caretaker/:patientId", verifyAccessToken, getCareNotesByCaretaker);

router.post("/edit-patient-blood-pressure-by-caretaker/:recordId", verifyAccessToken, upload.none(), editPatientBloodPressureByCaretaker);
router.post("/edit-patient-body-temp-by-caretaker/:recordId", verifyAccessToken, upload.none(), editPatientBodyTempByCaretaker);
router.post("/edit-patient-heart-rate-by-caretaker/:recordId", verifyAccessToken, upload.none(), editPatientHeartRateByCaretaker);
router.post("/edit-patient-body-weight-by-caretaker/:recordId", verifyAccessToken, upload.none(), editPatientBodyWeightByCaretaker);
router.post("/edit-patient-blood-sugar-by-caretaker/:recordId", verifyAccessToken, upload.none(), editPatientBloodSugarByCaretaker);

router.get("/get-all-carenotes-by-caretaker", verifyAccessToken, getAllCareNotesByCaretaker);

router.post("/delete-caretaker-byadmin/:caretakerId", verifyAccessToken, deleteCaretakerByAdmin);

router.get("/get-all-daily-care/:patientId", verifyAccessToken, getAllDailyCare);

router.post("/change-needs-task-status-by-caretaker/:needsId", verifyAccessToken, upload.none(), updateNeedsTaskStatus );
router.post("/change-appointment-task-status-by-caretaker/:appointmentId", verifyAccessToken, upload.none(),updateAppointmentTaskStatus );
router.post("/change-visitors-task-status-by-caretaker/:visitorId", verifyAccessToken, upload.none(), updateVisitorTaskStatus);
router.post("/change-meal-and-diet-task-status-by-caretaker/:mealId", verifyAccessToken, upload.none(), updateMealAndDietTaskStatus);
router.post("/change-activity-task-status-by-caretaker/:activityId", verifyAccessToken, upload.none(), updateActivityTaskStatus);
router.post("/add-activity-remarks/:activityId",verifyAccessToken,upload.none(), addActivityRemark);
router.post("/edit-activity-remarks/:activityId",verifyAccessToken,upload.none(), editActivityRemark);
router.post("/add-visitor-remarks/:visitorId",verifyAccessToken,upload.none(), addVisitorRemark);
router.post("/edit-visitor-remarks/:visitorId",verifyAccessToken,upload.none(), editVisitorRemark);
router.post("/add-needs-remarks/:needsId",verifyAccessToken,upload.none(), addNeedsRemark);
router.post("/edit-needs-remarks/:needsId",verifyAccessToken,upload.none(), editNeedsRemark);
router.post("/add-appointment-remarks/:appointmentId",verifyAccessToken,upload.none(), addAppointmentRemark);
router.post("/edit-appointment-remarks/:appointmentId",verifyAccessToken,upload.none(), editAppointmentRemark);
router.post("/add-meal-remarks/:mealId",verifyAccessToken,upload.none(), addMealRemark);
router.post("/edit-meal-remarks/:mealId",verifyAccessToken,upload.none(), editMealRemark);

export default router;
