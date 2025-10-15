import express from "express";
import upload from "../../config/multer.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
import {
  addPatientBloodPressure,
  addPatientBloodSugar,
  addPatientBodyTemp,
  addPatientBodyWeight,
  addPatientHeartRate,
  getPatientBloodPressure,
  getPatientBloodSugar,
  getPatientBodyTemp,
  getPatientBodyWeight,
  getPatientHeartRate,
  editPatientBloodPressure,
  editPatientBodyTemp,
  editPatientHeartRate,
  editPatientBodyWeight,
} from "../../module/controllers/patientRecordController.js";

const router = express.Router();

// POST: Add Patient Blood Pressure
router.post("/add-patient-BP",  upload.none(),  verifyAccessToken,  addPatientBloodPressure);

router.post("/add-patient-BS", upload.none(),verifyAccessToken,addPatientBloodSugar);

// 🌡️ Body Temperature
router.post("/add-patient-BT", upload.none(),verifyAccessToken, addPatientBodyTemp);

// ⚖️ Body Weight
router.post("/add-patient-BW",upload.none(), verifyAccessToken,addPatientBodyWeight);

router.post("/add-patient-heartRate",upload.none(),verifyAccessToken,addPatientHeartRate);
// -------------------- GET BLOOD PRESSURE --------------------
router.get("/get-patient-BP", verifyAccessToken, getPatientBloodPressure);

router.get("/get-patient-BS", verifyAccessToken, getPatientBloodSugar);

router.get("/get-patient-BT", verifyAccessToken, getPatientBodyTemp);
router.get("/get-patient-BW", verifyAccessToken, getPatientBodyWeight);

router.get("/get-patient-heartRate", verifyAccessToken, getPatientHeartRate);

router.post("/edit-blood-pressure", verifyAccessToken,upload.none(), editPatientBloodPressure);
router.post("/edit-body-temp", verifyAccessToken,upload.none(), editPatientBodyTemp);
router.post("/edit-heart-rate", verifyAccessToken,upload.none(), editPatientHeartRate);
router.post("/edit-body-weight", verifyAccessToken,upload.none(), editPatientBodyWeight);

export default router;
