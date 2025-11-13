import express from "express";
import { addMedication, updateMedication,addMedicationByCaretaker,
     getAllMedications,getAllMedicationsByAdmin,stopMedication,getAllActiveMedications } from "../controllers/medicationController.js"; 
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

export default router;
