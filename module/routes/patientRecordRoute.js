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


export default router;
