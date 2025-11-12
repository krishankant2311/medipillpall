import express from "express";
import {
  addPatientFileByCaretaker,
  getAllPatientFilesByCaretaker,
  getPatientFileByCaretaker,
  deletePatientFileByCaretaker,
  uploadPatientFile, getUploadedFiles,
} from "../controllers/patientFilesController.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js"; // your multer file

const router = express.Router();

router.post(
  "/add/:patientId",
  verifyAccessToken,
  upload.single("file"), // handle single file
  addPatientFileByCaretaker
);

router.get("/get/:patientId", verifyAccessToken, getAllPatientFilesByCaretaker);

router.get("/patient-file/:patientId/:fileId", verifyAccessToken, getPatientFileByCaretaker);
router.post("/delete/:patientId/:fileId", verifyAccessToken, deletePatientFileByCaretaker);

router.post("/upload/:patientId", verifyAccessToken, upload.single("file"), uploadPatientFile);
router.get("/uploads", verifyAccessToken, getUploadedFiles);

export default router;
