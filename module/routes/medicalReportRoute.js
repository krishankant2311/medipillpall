import express from "express";
import { uploadMedicalReport, getMedicalReports } from "../controllers/medicalReportController.js";
import upload from "../../config/multer.js"
import { verifyAccessToken , verifyRefreshToken } from "../../helpers/jwt.js"


const router = express.Router();

// Upload medical report (single file)
router.post(  "/upload-report",  verifyAccessToken,upload.array("files", 5),  uploadMedicalReport);
router.get("/my-reports", verifyAccessToken, getMedicalReports);


export default router;
