import express from "express";
import { createPrivacyPolicy, getPrivacyPolicy } from "../controllers/privacyPolicyController.js";
import { verifyAccessToken } from "../../helpers/jwt.js";  // agar aapke pass middleware hai
import upload from "../../config/multer.js";
const router = express.Router();

// Create or Update Privacy Policy (Admin Only)
router.post("/create", verifyAccessToken,upload.none(), createPrivacyPolicy);

// Get Privacy Policy (Admin, Patient, Guardian, Caretaker)
router.get("/get", verifyAccessToken, getPrivacyPolicy);

export default router;
