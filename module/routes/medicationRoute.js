import express from "express";
import { addMedication, updateMedication, getAllMedications,getAllMedicationsByAdmin,stopMedication } from "../controllers/medicationController.js"; 
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

router.post("/stop-medication",upload.none(),  verifyAccessToken,  stopMedication);
export default router;
