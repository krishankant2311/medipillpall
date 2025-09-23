import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: "",
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    password:{
        type:String,
        default:""
    },
    otp: {
      otpValue: {
        type: String,
        default: "",
      },
      otpExpiry: {
        type: String,
        default: "",
      },
    },
    // 👇 Token fields
    accessToken: {
      type: String,
      default: "",
    },
    refreshToken: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Delete"],
      default: "Active",
    },
    gender:{
        type:String,
        enum:["Male","Female","Transgender"],
        default:"Male",
    }
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
