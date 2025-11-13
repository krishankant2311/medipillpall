import express from "express";
import { addMedication, updateMedication,addMedicationByCaretaker,stopMedicationByCaretaker,getAllActiveMedicationsByCaretaker,
     getAllMedications,getAllStoppedMedicationsByCaretaker,getAllMedicationsByAdmin,stopMedication,getAllActiveMedications } from "../controllers/medicationController.js"; 
import upload from "../../config/multer.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
const router = express.Router();

// ➕ Add new medication
router.post("/add-medication",verifyAccessToken,upload.none(), addMedication);

// ✏️ Update medication by ID
router.post("/update-medication/:medicationId",verifyAccessToken,upload.none(),updateMedication);

// 📋 Get all medications (with pagination)
router.get("/medication-list", verifyAccessToken, upload.none(), getAllMedications);

router.get("/medication-list-byAdmin",verifyAccessToken,upload.none(), getAllMedicationsByAdmin);

router.get("/active-medication-list", verifyAccessToken, upload.none(), getAllActiveMedications);

router.post("/stop-medication",upload.none(),  verifyAccessToken,  stopMedication);

router.post("/addByCaretaker/:patientId", verifyAccessToken,upload.none(), addMedicationByCaretaker);

router.post("/stopByCaretaker/:medicationId", verifyAccessToken,upload.none(), stopMedicationByCaretaker);

router.get("/stopped-medication-list-by-caretaker/:patientId", verifyAccessToken, getAllStoppedMedicationsByCaretaker);

router.get("/active-medication-list-by-caretaker/:patientId", verifyAccessToken, getAllActiveMedicationsByCaretaker);

export default router;
