import Prescription from "../models/prescriptionModel.js";
import Patient from "../models/patientModel.js"; // patient model import

// ✅ Add Prescription
export const addPrescription = async (req, res) => {
  try {
    const token = req.token; // patient token
    const { time, dateStarted, medication, dose, comment } = req.body;

    // Patient validate
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    if (!medication) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Medication name is required",
        result: {},
      });
    }

    const prescription = new Prescription({
      patientId: patient._id,
      time,
      dateStarted,
      medication,
      dose,
      comment,
    });

    await prescription.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Prescription added successfully",
      result: prescription,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ✅ Edit Prescription
export const editPrescription = async (req, res) => {
  try {
    const token = req.token;
    const { id } = req.params; // prescription id
    const { time, dateStarted, medication, dose, comment } = req.body;

    // Patient validate
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    const prescription = await Prescription.findOneAndUpdate(
      { _id: id, patientId: patient._id },
      { time, dateStarted, medication, dose, comment },
      { new: true }
    );

    if (!prescription) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Prescription not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Prescription updated successfully",
      result: prescription,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ✅ Get Prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const token = req.token;
    const patientId = req.params
    let { page = 1, limit = 10 } = req.query;

    // Patient validate
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const prescriptions = await Prescription.find({
      patientId: patient._id,
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Prescription.countDocuments({
      patientId: patient._id,
      status: "Active",
    });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Prescription list fetched successfully",
      result: prescriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ✅ Delete Prescription (soft delete)
export const deletePrescription = async (req, res) => {
  try {
    const token = req.token;
    const { id } = req.params;

    // Patient validate
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    const prescription = await Prescription.findOneAndUpdate(
      { _id: id, patientId: patient._id },
      { status: "Delete" },
      { new: true }
    );

    if (!prescription) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Prescription not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Prescription deleted successfully",
      result: prescription,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
