import mongoose from "mongoose";

const personalContactSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Delete"],
      default: "Active",
    },
  },
  { timestamps: true }
);

const PersonalContact = mongoose.model("PersonalContact", personalContactSchema);
export default PersonalContact;
