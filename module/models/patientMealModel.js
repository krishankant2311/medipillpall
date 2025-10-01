import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
    },
    mealType: {
      type: String,
      enum: ["Breakfast", "Snack", "Lunch", "Dinner"],
    },
    foodItems: {
      type: [String], // multiple items like ["2 chapati", "dal"]
    },
    medication: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;
