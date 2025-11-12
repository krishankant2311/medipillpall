import MealAndDiet from "../models/mealAndDietModel.js";
import Caretaker from "../models/caretakerModel/caretakerModel.js";
import Patient from "../models/patientModel.js";

// 🥗 Add Meal or Diet (Caretaker)
export const addMealAndDiet = async (req, res) => {
  try {
    // token se caretaker identify hoga
    const token = req.token;
const {patientId} = req.params;
    const {
      type,
      mealType,
      scheduleTime,
      foodType,
      portionSize,
      specialDietFollowed,
      remarks,
      planName,
      startDate,
      endDate,
      instructions,
      dailyMeals
    } = req.body;

    // 🧩 caretaker validate karo
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active"
    });

    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid caretaker"
      });
    }

    // 🧩 patient validate karo
    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active"
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // 🌐 Base URL set karo (live or local)
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // 🧩 file path agar upload hua ho
    const filePath = req.file
      ? type === "Meal"
        ? `${baseUrl}/uploads/mealPhotos/${req.file.filename}`
        : `${baseUrl}/uploads/dietDocs/${req.file.filename}`
      : "";

    // 🧩 dailyMeals agar array string me aaye to parse karo
    let dailyMealsData = [];
    if (dailyMeals) {
      dailyMealsData =
        typeof dailyMeals === "string"
          ? JSON.parse(dailyMeals)
          : dailyMeals;
    }

    // 🧩 data prepare karo
    const data = {
      caretakerId: caretaker._id,
      patientId: patient._id,
      type: type || "Meal",
      mealType: mealType || "",
      scheduleTime: scheduleTime || "",
      foodType: foodType || "",
      portionSize: portionSize || "",
      specialDietFollowed: specialDietFollowed || "",
      remarks: remarks || "",
      planName: planName || "",
      startDate: startDate || null,
      endDate: endDate || null,
      instructions: instructions || "",
      dailyMeals: dailyMealsData,
      mealPhoto: type === "Meal" ? filePath : "",
      attachedDoc: type === "Diet" ? filePath : ""
    };

    // 🧩 document save karo
    const newEntry = new MealAndDiet(data);
    await newEntry.save();

    // ✅ response
    return res.status(200).json({
      success: true,
      message: `${type} added successfully`,
      result: newEntry
    });
  } catch (error) {
    console.error("Add Meal/Diet Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
