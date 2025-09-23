import express from "express";
import {
  addPrescription,
  editPrescription,
  getPrescriptions,
  deletePrescription,
} from "../controllers/prescriptionController.js";

import upload from "../../config/multer.js";

import { verifyAccessToken } from "../../helpers/jwt.js"; 

const router = express.Router();

// Add new prescription
router.post("/add", verifyAccessToken, upload.none(), addPrescription);

// Edit prescription by ID
router.post("/edit/:id", verifyAccessToken,upload.none(), editPrescription);

// Get all prescriptions (pagination included)
router.get("/get/:patientId", verifyAccessToken, getPrescriptions);

// Soft delete prescription by ID
router.post("/delete/:id", verifyAccessToken,upload.none(), deletePrescription);

export default router;
