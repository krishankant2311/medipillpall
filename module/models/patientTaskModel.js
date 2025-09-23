import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    title: {
      type: String,
      required: true, // Task title (e.g., Lunch, Medication, etc.)
    },
    time: {
      type: String, // You can store as "HH:mm" or use Date if full datetime needed
      required: true,
    },
    type: {
      type: String,
      enum: ["Meal", "Medication", "Exercise", "Other"], // Example categories
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
