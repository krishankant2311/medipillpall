import mongoose from "mongoose";
import Patient from "./patientModel.js";
const patientRecordSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", // Patient model से link
      required: true,
    },

    // 🩺 Blood Pressure
    bloodPressure: {
      day: { type: String, default: "" },
      amBP: { type: String, default: "" },
      pmBP: { type: String, default: "" },
      comments: { type: String, default: "" },
    },

    // 🩸 Blood Sugar
    bloodSugar: {
      day: { type: String, default: "" },
      before: { type: String, default: "" },
      after: { type: String, default: "" },
      insulinDose: { type: String, default: "" }, // m/l dose
      notes: { type: String, default: "" },
    },

    // 🌡️ Body Temperature
    bodyTemp: {
      day: { type: String, default: "" },
      time: { type: String, default: "" },
      amTemp: { type: String, default: "" },
      pmTemp: { type: String, default: "" },
      notes: { type: String, default: "" },
      insulinDose: { type: String, default: "" }, // m/l dose
    },
    heartRate: {
      day: { type: String, default: "" }, // e.g. Monday
      time: { type: String, default: "" }, // e.g. Morning / Evening
      amRate: { type: String, default: "" }, // A.M. Heart Rate
      pmRate: { type: String, default: "" }, // P.M. Heart Rate
      notes: { type: String, default: "" }, 
    },

    // ⚖️ Body Weight
    bodyWeight: {
      day: { type: String, default: "" },
      weight: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

 const PatientRecord = mongoose.model(
  "PatientRecord",
  patientRecordSchema
);
export default PatientRecord;
