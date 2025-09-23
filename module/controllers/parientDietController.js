import Patient from "../models/patientModel.js";
import DietInstruction from "../models/patientDietModel.js";


export const addDietInstruction = async (req, res) => {
  try {
    let token = req.token;
    const { specialLikes, dailyFavorites, doesNotLike } = req.body;

    const patient = await Patient.findOne({ _id:token._id });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const newDiet = new DietInstruction({
      patient_id: patient._id,
      specialLikes,
      dailyFavorites,
      doesNotLike,
    });

    await newDiet.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Diet Instruction added successfully",
      result: newDiet,
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

export const editDietInstruction = async (req, res) => {
  try {
    const { dietId } = req.params;
    const { specialLikes, dailyFavorites, doesNotLike } = req.body;

    let token = req.token;
    const patient = await Patient.findOne({_id:token._id, status:"Active"});
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const diet = await DietInstruction.findById({dietId, status:"Active"});
    if (!diet) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Diet Instruction not found",
        result: {},
      });
    }

    if (diet.patient_id.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to edit this diet instruction",
        result: {},
      });
    }

    diet.specialLikes = specialLikes || diet.specialLikes;
    diet.dailyFavorites = dailyFavorites || diet.dailyFavorites;
    diet.doesNotLike = doesNotLike || diet.doesNotLike;

    await diet.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Diet Instruction updated successfully",
      result: diet,
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

export const getDietInstructions = async (req, res) => {
  try {
    let token = req.token;
    let { page = 1, limit = 10, patientId } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = {};
    if (patientId) {
      query.patient_id = patientId;
    } else {
      const patient = await Patient.findOne({ _id:token._id, status:"Active" });
      if (!patient) {
        return res.send({
          statusCode: 401,
          success: false,
          message: "Invalid patient token",
          result: {},
        });
      }
      query.patient_id = patient._id;
    }

    query.status = "Active";

    const diets = await DietInstruction.find({query, status: "Active" })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await DietInstruction.countDocuments({query, status: "Active" });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Diet Instructions fetched successfully",
      result: diets,
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

export const deleteDietInstruction = async (req, res) => {
  try {
    const { dietId } = req.params;
    let token = req.token;

    const patient = await Patient.findOne({ _id:token._id });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const diet = await DietInstruction.findById(dietId);
    if (!diet) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Diet Instruction not found",
        result: {},
      });
    }

    if (diet.patient_id.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to delete this diet instruction",
        result: {},
      });
    }

    diet.status = "Delete";
    await diet.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Diet Instruction deleted successfully",
      result: diet,
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
