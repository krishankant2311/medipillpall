import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,          // e.g., "Doctor’s Appointment"
      required: true,
      trim: true,
    },

    time: {
      type: String,          // "3:00 PM"
      required: true,
    },

    reason: {
      type: String,          // "For routine checkup"
      default: "",
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },

    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
