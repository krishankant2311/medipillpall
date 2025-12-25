import express from "express";
import { uploadMedicalReport, getMedicalReports,downloadMedicalReport,getMedicalReportByIdbypatient,softdeleteMedicalReport } from "../controllers/medicalReportController.js";
import upload from "../../config/multer.js"
import { verifyAccessToken , verifyRefreshToken } from "../../helpers/jwt.js"


const router = express.Router();

// Upload medical report (single file)
router.post(  "/upload-report",  verifyAccessToken,upload.array("files", 5),  uploadMedicalReport);
router.get("/my-reports", verifyAccessToken, getMedicalReports);
router.post("/delete-report/:reportId", verifyAccessToken, softdeleteMedicalReport);
router.get("/download-report/:reportId", verifyAccessToken, downloadMedicalReport);


export default router;
