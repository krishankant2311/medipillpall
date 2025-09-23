import mongoose from "mongoose";
import { createDefaultAdmin } from "../module/models/adminModel.js"
import dotenv from "dotenv";
dotenv.config();

export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      autoIndex: true, // Index build automatically
    });

    console.log("✅ Connected to MongoDB");
    createDefaultAdmin();
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1); // Server ko stop kar de agar DB connect na ho
  }
};
