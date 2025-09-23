import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    medicationName: {
      type: String,
      default: "",
    //   trim: true,
    },
    dosage: {
      type: String, // Example: "10mg"
      default: "",
    },
    times: [
      {
        type: String, // Example: "08:00 AM", "08:00 PM"
      default: "",
      },
    ],
    startingDate: {
      type: Date,
    //   required: true,
          default: "",
    },
    reason: {
      type: String,
      default: "",
    },
    quantity:{
        type:String,
        default:""
    },
    status:{
      type: String,
      enum: ["Active", "Stopped"],
      default: "Active",
    },
    alertLevel:{
        type:String,
        default:""
    }
  },
  { timestamps: true }
);

export const Medication = mongoose.model("Medication", medicationSchema);
export default Medication;
