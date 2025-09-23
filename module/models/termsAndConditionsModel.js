import mongoose from "mongoose";

const terms_conditionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const TermsCondition = mongoose.model("termsCondition", terms_conditionSchema);

export default TermsCondition;
