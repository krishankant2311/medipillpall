import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adminSchema = new mongoose.Schema({
    fullName: {
        type: String,
        default:""
    },
    email: {
        type: String,
        default:""
    },
    status: {
        type: String,
        enum: ["Active", "Delete"],
        default: "Active",
    },
    accesstoken: {
        type: String,
        default:""
    },
    refreshtoken: {
        type: String,
        default:""
    },
    otp:{
      otpValue: { type: String, default: "" },
      otpExpiry: { type: Date, default: null },
    },
    securityToken:{
      type: String,
      default:""
    },
    password: {
        type: String,
        default:""
    },
}, { timestamps: true });
export const Admin = mongoose.model("Admin", adminSchema);
export default Admin;

export const createDefaultAdmin = async () => {
  try {
    const email = "krishankant@jewarinternational.com";
    const admin = await Admin.findOne({ email });
    if (admin) {
      console.log("✅ Admin already exists");
      return;
    }

    const password = "Admin@123";
    const enc_password = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      fullName: "",
      email,
      password: enc_password,
    });

    await newAdmin.save();
    console.log("✅ Default Admin created successfully");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
};

