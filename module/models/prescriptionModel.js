import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    time: { type: String, default: "" },
    dateStarted: { type: String, default: "" },
    medication: { type: String, default: "" },
    dose: { type: String, default: "" },
    comment: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Delete"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
