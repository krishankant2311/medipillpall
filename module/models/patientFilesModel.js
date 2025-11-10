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
    file: {
      type: String,
      default: "",
      required: true,
    },
    fileType: {
      type: String,
      default: "",
    //   required: true,
    },
    description: {
      type: String,
      default: "",
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
