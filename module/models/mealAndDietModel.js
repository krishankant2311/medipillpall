import mongoose from "mongoose";

const mealAndDietSchema = new mongoose.Schema({

  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Caretaker",
    // required: true
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  // 🔹 Type will decide whether it's a Meal entry or a Diet Plan
  type: {
    type: String,
    enum: ["Meal", "Diet"],
    // required: true,
    default: "Meal"
  },

  // -------------------------------
  // Fields used when type = "Meal"
  // -------------------------------

  mealType: {
    type: String,
    enum: ["Breakfast", "Lunch", "Snack", "Dinner"],
    default: ""
  },
taskStatus: {
    type: String,
    enum: ["Completed", "Pending","Skipped"],
    default: "Pending"
  },
  scheduleTime: {
    type: String,
    default: ""
  },

  time: {
    type: String,
    default: ""
  },
  foodType: {
    type: String,
    default: ""
  },

  portionSize: {
    type: String,
    default: ""
  },

  specialDietFollowed: {
    type: String,
    default: ""
  },

  remarks: {
    type: String,
    default: ""
  },

 mealPhoto: {
  type: [String],
  default: []
},

  status: {
    type: String,
    enum: ["Active", "Pending","Taken"],
    default: "Active"
  },

  date: {
    type: Date,
    default: Date.now
  },
 remarkAndObservations: {
    type: String,
    default: ""
  },
  // -------------------------------
  // Fields used when type = "Diet"
  // -------------------------------

  planName: {
    type: String,
    default: ""
  },

  startDate: {
    type: Date
  },

  endDate: {
    type: Date
  },

  instructions: {
    type: String,
    default: ""
  },

  dailyMeals: [
    {
      mealType: {
        type: String,
        default: ""
      },
      time: {
        type: String,
        default: ""
      },
      foodType: {
        type: String,
        default: ""
      },
      portionSize: {
        type: String,
        default: ""
      }
    }
  ],
  calories: {
    type: String,
    default: "",
  },

  attachedDoc: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("MealAndDiet", mealAndDietSchema);
