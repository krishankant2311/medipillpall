import Meal from "../models/patientMealModel.js";
import Patient from "../models/patientModel.js";
import Admin from "../models/adminModel.js";

export const addMeal = async (req, res) => {
  try {
    let token = req.token;
    const { mealType, foodItems, medication, status, caretakerId } = req.body;

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }
    if(!mealType){
        return res.send({
            statusCode: 400,
            success: false,
            message: "mealType is required",
            result: {},
          });
    }
    if(!foodItems || !Array.isArray(foodItems) || foodItems.length===0){
        return res.send({
            statusCode: 400,
            success: false,
            message: "foodItems should be a non-empty array",
            result: {},
          });
    }

    const newMeal = new Meal({
      patientId: patient._id,
      caretakerId,
      mealType,
      foodItems,
      medication,
      status,
    });

    await newMeal.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Meal added successfully",
      result: newMeal,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// ✅ Edit Meal
export const editMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const { mealType, foodItems, medication, status } = req.body;

    let token = req.token;
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const meal = await Meal.findOne({ _id: mealId, status: { $ne: "Deleted" } });
    if (!meal) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Meal not found",
        result: {},
      });
    }

    if (meal.patientId.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to edit this meal",
        result: {},
      });
    }

    meal.mealType = mealType || meal.mealType;
    meal.foodItems = foodItems || meal.foodItems;
    meal.medication = medication || meal.medication;
    meal.status = status || meal.status;

    await meal.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Meal updated successfully",
      result: meal,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// ✅ Get Meals (with pagination)
export const getMeals = async (req, res) => {
  try {
    let token = req.token;
    let { page = 1, limit = 10, patientId } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = { status: { $ne: "Deleted" } };

    if (patientId) {
      query.patientId = patientId;
    } else {
      const patient = await Patient.findOne({ _id: token._id, status: "Active" });
      if (!patient) {
        return res.send({
          statusCode: 401,
          success: false,
          message: "Invalid patient token",
          result: {},
        });
      }
      query.patientId = patient._id;
    }

    const meals = await Meal.find(query)
      .populate("patientId")
      .populate("caretakerId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Meal.countDocuments(query);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Meals fetched successfully",
      result: meals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// ✅ Delete Meal (soft delete)
export const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    let token = req.token;

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Meal not found",
        result: {},
      });
    }

    if (meal.patientId.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to delete this meal",
        result: {},
      });
    }

    meal.status = "Deleted";
    await meal.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Meal deleted successfully",
      result: meal,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// ✅ Get All Meals (no pagination)
export const getAllMealsByAdmin = async (req, res) => {
  try {
    let token = req.token;
    let { patientId } = req.query;

    if (!patientId) {   
        return res.send({
        statusCode: 400,
        success: false,
        message: "patientId is required",
        result: {},
      });
    }
    const admin = await Admin.findOne({ _id: token._id, status: "Active" });

    if (!admin) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid admin token",
        result: {},
      });
    }

    const patient = await Patient.findOne({ _id:patientId, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }


    const meals = await Meal.find({ 
        patientId: patient._id, 
        status: { $ne: "Deleted" } 
      })
      .populate("patientId")
      .populate("caretakerId")
      .sort({ createdAt: -1 });

    return res.send({
      statusCode: 200,
      success: true,
      message: "All meals fetched successfully",
      result: meals,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};
