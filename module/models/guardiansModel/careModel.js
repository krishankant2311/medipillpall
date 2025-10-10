import mongoose from "mongoose";

const careNoteSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    guardianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guardian",
    },
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    noteType: {
      type: String,
      enum: ["medication", "observation", "instruction", "other"],
      default: "other",
    },
    description: {
      type: String,
    //   trim: true,
      default: "",
    },
    date: {
      type: Date,
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

export default mongoose.model("CareNote", careNoteSchema);
