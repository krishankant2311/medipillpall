import mongoose from "mongoose";

const dietInstructionSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    specialLikes: [
      {
        type: String,
        default: "",
      },
    ],
    dailyFavorites: [
      {
        type: String,
        default: "",
      },
    ],
    doesNotLike: [
      {
        type: String,
        default: "",
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Delete"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const DietInstruction = mongoose.model("DietInstruction", dietInstructionSchema);
export default DietInstruction; 