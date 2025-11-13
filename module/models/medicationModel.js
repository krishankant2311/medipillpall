import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      default: null, // null means patient khud add kar raha hai
    },

    medicationName: {
      type: String,
      trim: true,
      default: "",
    },

    dosage: {
      type: String, // Example: "10mg"
      default: "",
    },

    times: [
      {
        type: String, // Example: "08:00 AM", "08:00 PM"
        default: "",
      },
    ],

    startingDate: {
      type: Date,
      default: null,
    },

    reason: {
      type: String,
      default: "",
    },

    quantity: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Stopped", "Completed","Skipped"],
      default: "Active",
    },

    alertLevel: {
      type: String,
      default: "",
    },

    comments: {
      type: String,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Medication = mongoose.model("Medication", medicationSchema);
export default Medication;
