import mongoose from "mongoose";

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      default: "",
    },
    answer: {
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

const FAQ = mongoose.model("FAQ", FAQSchema);

export default FAQ;
