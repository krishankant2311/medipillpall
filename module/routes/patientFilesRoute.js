import express from "express";
import {
  addPatientFileByCaretaker,
  getAllPatientFilesByCaretaker,
  getPatientFileByCaretaker,
  deletePatientFileByCaretaker,
  uploadPatientFile, getUploadedFiles,
  getPatientFilesByCaretaker,
  getAllPatientsWithFilesByCaretaker,
  getAllFilesByCaretaker,
  getAllPatientFiles,
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
router.get("/getPatient-FilesBy-Caretaker/:patientId", verifyAccessToken, getPatientFilesByCaretaker);
router.get("/patients-with-files", verifyAccessToken, getAllPatientsWithFilesByCaretaker);
router.get("/all-files", verifyAccessToken, getAllFilesByCaretaker);
router.get("/all-patient-files", verifyAccessToken, getAllPatientFiles);
export default router;
