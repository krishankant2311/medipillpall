import express from "express";
import {
  addHealthcareProvider,
  editHealthcareProvider,
  deleteHealthcareProvider,
  getHealthcareProvider,
  getAllHealthcareProviders,
} from "../controllers/healthcareProviderController.js";
import { verifyAccessToken } from "../../helpers/jwt.js"; // assuming you have JWT middleware
import upload from "../../config/multer.js"; // if you need file uploads
const router = express.Router();

// All routes require token verification
router.use(verifyAccessToken);

// Add a Healthcare Provider
router.post("/add",upload.none(), addHealthcareProvider);

// Edit a Healthcare Provider
router.post("/edit",upload.none(), editHealthcareProvider);

// Delete a Healthcare Provider (soft delete)
router.delete("/delete",upload.none(), deleteHealthcareProvider);

// Get a single Healthcare Provider by ID
router.get("/get/:providerId",upload.none(), getHealthcareProvider);

// Get all Healthcare Providers for logged-in patient
router.get("/get-all",upload.none(), getAllHealthcareProviders);

export default router;
