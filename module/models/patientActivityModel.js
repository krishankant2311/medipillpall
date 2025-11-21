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
    title: { 
      type: String, 
      default: "" 
    },
    activityType: {
      type: String,
      enum: [
        "Exercise",
        "Resistance Bands",
        "Puzzle & Memory Skills",
        "Reading Books",
        "Prayer Music",
        "Crafts & Coloring",
        "Morning Hygiene",
      ],
      required: true,
    },
    taskStatus: {
      type: String,
      enum: ["Completed","Skipped", "Pending"],
      default: "Pending",
    },
    time: {
      type: String,
      default: ""
    },
    duration: {
      type: String,
      def:""// Minutes
    },
    date: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: String,
      default: null,
    },
     remarkAndObservations: {
    type: String,
    default: ""
  },
    status: {
      type: String,
      enum: ["Active", "Pending","Delete"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
