import express from "express";
import {
  addAppointmentByPatient,
  editAppointmentByPatient
} from "../controllers/patientAppointmentController.js";

import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js";
const router = express.Router();

// -----------------------------------------
// 🟩 Add Appointment (Patient)
// -----------------------------------------
router.post("/add-appointment",verifyAccessToken,upload.none(),addAppointmentByPatient);;

// -----------------------------------------
// 🟦 Edit Appointment (Patient)
// -----------------------------------------
router.post("/edit-appointment/:appointmentId", verifyAccessToken,upload.none(), editAppointmentByPatient);

export default router;
