import express from "express";
import {
  addTermsCondition,
  updateTermsCondition,
  getTermsCondition,
} from "../controllers/termsAndConditionsController.js";
import { verifyAccessToken } from "../../helpers/jwt.js"; // token check middleware
const router = express.Router();
import upload from "../../config/multer.js";

// ➕ Add Terms & Conditions (Admin only)
router.post("/add", verifyAccessToken,upload.none(), addTermsCondition);  
// ✏️ Update Terms & Conditions (Admin only)
router.post("/update", verifyAccessToken,upload.none(), updateTermsCondition);
// 📋 Get Terms & Conditions (Public
router.get("/get", getTermsCondition);
export default router;