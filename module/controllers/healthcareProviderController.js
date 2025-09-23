import HealthcareProvider from "../models/healthcareProviderModel.js";
import Patient from "../models/patientModel.js"; // Assuming you have a Patient model

// Add Healthcare Provider
export const addHealthcareProvider = async (req, res) => {
  try {
    const { doctorName, speciality, phone, hospitalOrClinic, hospitalPhone } = req.body;
    const token = req.token; // patient token

    if (!doctorName) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Doctor Name is required",
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

    const newProvider = new HealthcareProvider({
      patient_id: token._id,
      doctorName,
      speciality,
      phone,
      hospitalOrClinic,
      hospitalPhone,
    });

    await newProvider.save();

    return res.send({
      statusCode: 201,
      success: true,
      message: "Healthcare Provider added successfully",
      result: newProvider,
    });
  } catch (error) {
    console.error("Error in addHealthcareProvider:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Edit Healthcare Provider
export const editHealthcareProvider = async (req, res) => {
  try {
    const { providerId, doctorName, speciality, phone, hospitalOrClinic, hospitalPhone } = req.body;
    const token = req.token;

    if (!providerId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "providerId is required",
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

    const updatedProvider = await HealthcareProvider.findOneAndUpdate(
      { _id: providerId, patient_id: token._id },
      { doctorName, speciality, phone, hospitalOrClinic, hospitalPhone },
      { new: true }
    );

    if (!updatedProvider) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Healthcare Provider not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Healthcare Provider updated successfully",
      result: updatedProvider,
    });
  } catch (error) {
    console.error("Error in editHealthcareProvider:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Delete Healthcare Provider (soft delete)
export const deleteHealthcareProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const token = req.token;

    if (!providerId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "providerId is required",
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

    const deletedProvider = await HealthcareProvider.findOneAndUpdate(
      { _id: providerId, patient_id: token._id },
      { status: "Delete" },
      { new: true }
    );

    if (!deletedProvider) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Healthcare Provider not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Healthcare Provider deleted successfully",
      result: deletedProvider,
    });
  } catch (error) {
    console.error("Error in deleteHealthcareProvider:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Get single Healthcare Provider
export const getHealthcareProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const token = req.token;

    if (!providerId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "providerId is required",
        result: {},
      });
    }

    const provider = await HealthcareProvider.findOne({ _id: providerId, patient_id: token._id, status: "Active" });

    if (!provider) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Healthcare Provider not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Healthcare Provider fetched successfully",
      result: provider,
    });
  } catch (error) {
    console.error("Error in getHealthcareProvider:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Get all Healthcare Providers for patient
export const getAllHealthcareProviders = async (req, res) => {
  try {
    const token = req.token;

    const providers = await HealthcareProvider.find({ patient_id: token._id, status: "Active" });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Healthcare Providers fetched successfully",
      result: providers,
    });
  } catch (error) {
    console.error("Error in getAllHealthcareProviders:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
