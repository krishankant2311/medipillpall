import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },
    activityType: {
      type: String,
      enum: [
        "Exercise",
        "Resistance Bands",
        "Puzzle & Memory Skills",
        "Reading Books",
        "Prayer Music",
        "Crafts & Coloring"
      ],
      required: true,
    },
    duration: {
      type: Number,
      required: true, // Minutes
    },
    details: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
