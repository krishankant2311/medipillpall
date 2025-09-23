import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription", // ya Medication Model agar separate hai
      default: null,
    },
    reminderTime: {
      type: String,
      default: "",
    },
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Custom", ""],
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Delete", ""],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
