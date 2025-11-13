import mongoose from "mongoose";

const MedicationInventorySchema = new mongoose.Schema(
  {
    // Either caretaker or patient will add
    addedByRole: {
      type: String,
      enum: ["Patient", "Caretaker"],
    //   required: true,
    },

    // If caretaker adds, this will store caretaker ID
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },

    // Always store which patient this belongs to
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    //   required: true,
    },

    // Medication details
    medicationName: {
      type: String,
    //   required: true,
    //   trim: true,
    default: "",
    },
    dosage: {
      type: String,
    //   trim: true,
    default: "",
    },

    // Inventory details
    currentStockQuantity: {
      type: Number,
    //   required: true,
      default: 0,
    },
    lowStockAlertLevel: {
      type: Number,
    //   required: true,
      default: 0,
    },

    // Stock status like in caregiver UI (Adequate, Low, Critical)
    stockStatus: {
      type: String,
      enum: ["Adequate", "Low Stock", "Critical"],
      default: "Adequate",
    },

    // Optional notes or description
    notes: {
      type: String,
      trim: true,
        default: "",
    },

    // Soft delete
  status:{
    type: String,
    enum: ["Active", "Deleted"],
    default: "Active",
  }
  },
  { timestamps: true }
);

export default mongoose.model("MedicationInventory", MedicationInventorySchema);
