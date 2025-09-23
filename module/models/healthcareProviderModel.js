import mongoose from "mongoose";

const healthcareProviderSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",  // Assuming each provider is linked to a patient
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    speciality: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    hospitalOrClinic: {
      type: String,
      default: "",
    },
    hospitalPhone: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Delete"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const HealthcareProvider = mongoose.model(
  "HealthcareProvider",
  healthcareProviderSchema
);

export default HealthcareProvider;
