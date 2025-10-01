import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: String, // e.g., "2 Hours", "30 Mins"
      required: true,
    },
    reason: {
      type: String,
      default: "For personal reason",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient", // optional if visitors are tied to a patient
    },
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker", // optional if needed
    },
    status: {
      type: String,
      enum: ["Active", "Deleted"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;
