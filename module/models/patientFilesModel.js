import e from "express";
import mongoose from "mongoose";

const patientFileSchema = new mongoose.Schema(
  {
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    documentType: {
      type: String,
      enum: ["Lab Reports", "Prescription", "DNR Form", "Other"],
      default: "Other",
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileName: String,
    fileSize: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("PatientFile", patientFileSchema);
