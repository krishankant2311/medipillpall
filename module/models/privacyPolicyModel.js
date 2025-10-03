import mongoose from "mongoose";

const privacypolicySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
}, { timestamps: true });

const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacypolicySchema);

export default PrivacyPolicy;
