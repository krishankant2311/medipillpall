import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      default: "",
    },
    title: {
      type: String,
      // required: true,
      trim: true,
    }, // e.g. Diabetes, Hypertension
    description: {
      type: String,
      default: "",
    }, // detailed description
    allergies: {
      type: [String],
      default: [],
    }, // multiple allergies
    conditions: {
      // Pacemaker / Stent / None
      pacemaker: {
        type: Boolean,
        default: false,
      },
      stent: {
        type: Boolean,
        default: false,
      },
      none: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true } // createdAt & updatedAt automatically
);

const MedicalHistory = mongoose.model("MedicalHistory", medicalHistorySchema);
export default MedicalHistory;
