import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    fileUrl: {
      type: String, // S3 / Cloudinary / local path
      required: true,
    },
    fileType: {
      type: String,
      enum: ["PDF", "JPG", "PNG"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Delete"],
      default: "Active",
    },
  },
  { timestamps: true }
);
const medicalReport = mongoose.model("MedicalReport", medicalReportSchema);
export default medicalReport;
