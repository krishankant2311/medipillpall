import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    relation: {
      type: String, // e.g., Uncle, Daughter, Friend
      // required: true,
      default: "",
    },
    duration: {
      type: String, // e.g., "2 Hours", "30 Mins"
      // required: true,
      default: "",
    },
    reason: {
      type: String,
      default: "For personal reason",
    },
    taskStatus: {
      type: String,
      enum: ["Pending", "Completed", "Skipped"],
      default: "Pending",
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
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
    time: {
      type: String,
      default: ""
    },
    // taskStatus: {
    //   type: String,
    //   enum: ["Pending", "Completed","Skipped"],
    //   default: "Pending",
    // },
  },
  { timestamps: true }
);
const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;
