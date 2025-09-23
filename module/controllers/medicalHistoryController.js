import MedicalHistory from "../models/medicalHistoryModel.js";
import Patient from "../models/patientModel.js";

// Add Medical History
export const addMedicalHistory = async (req, res) => {
  try {
    const { title, description, allergies, conditions } = req.body;
    const token = req.token; // 👈 yaha se patient milega

    if (!title || !description || !allergies || !conditions) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "All fields (title, description, allergies, conditions) are required",
        result: {},
      });
    }

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    const newHistory = new MedicalHistory({
      patientId: patient._id, // 👈 relation save
      title,
      description,
      allergies,
      conditions,
    });

    await newHistory.save();

    return res.send({
      statusCode: 201,
      success: true,
      message: "Medical history added successfully",
      result: newHistory,
    });
  } catch (error) {
    console.error("Error in addMedicalHistory:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// Edit Medical History
export const editMedicalHistory = async (req, res) => {
  try {
    const { title, description, allergies, conditions } = req.body;
    const token = req.token;
    const { historyId } = req.params;
    if (!historyId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "historyId is required",
        result: {},
      });
    }

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    const history = await MedicalHistory.findOne({ _id: historyId, patientId: patient._id });
    if (!history) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Medical history not found or unauthorized",
        result: {},
      });
    }

    history.title = title || history.title;
    history.description = description || history.description;
    history.allergies = allergies || history.allergies;
    history.conditions = conditions || history.conditions;

    await history.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Medical history updated successfully",
      result: history,
    });
  } catch (error) {
    console.error("Error in editMedicalHistory:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// Get Medical History by Patient
export const getMedicalHistoryByPatient = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "patientId is required",
        result: {},
      });
    }

    // validate token patient
    const patientFromToken = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patientFromToken) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized or inactive patient",
        result: {},
      });
    }

    // validate requested patientId
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    const totalRecords = await MedicalHistory.countDocuments({ patientId });
    const histories = await MedicalHistory.find({ patientId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Medical history fetched successfully",
      pagination: {
        totalRecords,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        pageSize: histories.length,
      },
      result: histories,
    });
  } catch (error) {
    console.error("Error in getMedicalHistoryByPatient:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};
