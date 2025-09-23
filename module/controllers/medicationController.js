import Patient from "../../module/models/patientModel.js";
import Medication from "../models/medicationModel.js"; // apne schema ka path

// ✅ Add Medication
export const addMedication = async (req, res) => {
  try {
    let token = req.token; // token se patient identify hoga
    const { medicationName, dosage, time, startingDate, reason } = req.body;

    // Validations
    if (!medicationName) {
  return res.send({
    statusCode: 400,
    success: false,
    message: "Medication name is required",
    result: {},
  });
}

if (!dosage) {
  return res.send({
    statusCode: 400,
    success: false,
    message: "Dosage is required",
    result: {},
  });
}

if (!time) {
  return res.send({
    statusCode: 400,
    success: false,
    message: "Time is required",
    result: {},
  });
}

if (!startingDate) {
  return res.send({
    statusCode: 400,
    success: false,
    message: "Starting date is required",
    result: {},
  });
}

if (!reason) {
  return res.send({
    statusCode: 400,
    success: false,
    message: "Reason is required",
    result: {},
  });
}


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

    // Medication object
    const newMedication = new Medication({
      patient_id: token._id,
      medicationName: medicationName?.trim(),
      dosage: dosage?.trim(),
      times: [time],
      startingDate,
      reason: reason?.trim(),
    });

    await newMedication.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Medication record added successfully",
      result: newMedication,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in add medication api",
      result: {},
    });
  }
};

// ✅ Update Medication
export const updateMedication = async (req, res) => {
  try {
    let token = req.token;
    const { medicationId } = req.params;
    const {  medicationName, dosage, time, startingDate, reason, status } = req.body;

    if (!medicationId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Required medicationId",
        result: {},
      });
    }

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
    // Medication check
const medication = await Medication.findOne({ _id: medicationId, patient_id: patient._id });
    if (!medication) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Medication not found",
        result: {},
      });
    }

    // Update fields only if provided
    if (medicationName) medication.medicationName = medicationName.trim();
    if (dosage) medication.dosage = dosage.trim();
    if (time) medication.times = [time];
    if (startingDate) medication.startingDate = startingDate;
    if (reason) medication.reason = reason.trim();
    if (status) medication.status = status;

    await medication.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Medication updated successfully",
      result: medication,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in update medication api",
      result: {},
    });
  }
};

// ✅ Get All Medications (Patient self)
export const getAllMedications = async (req, res) => {
  try {
    let token = req.token;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

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

    const totalMedications = await Medication.countDocuments({ patient_id: patient._id });

    const medications = await Medication.find({ patient_id: patient._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Medications fetched successfully",
      result: {
        total: totalMedications,
        page,
        limit,
        totalPages: Math.ceil(totalMedications / limit),
        medications,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in get all medications api",
      result: {},
    });
  }
};

// ✅ Get All Medications (Admin)
export const getAllMedicationsByAdmin = async (req, res) => {
  try {
    const { patientId, page = 1, limit = 10 } = req.query;

    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Required patientId",
        result: {},
      });
    }

    // Patient validate (status active check for admin bhi)
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const medications = await Medication.find({ patient_id: patientId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Medication.countDocuments({ patient_id: patientId });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Medications fetched successfully",
      result: {
        patient,
        medications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllMedicationsByAdmin api",
      result: {},
    });
  }
};

// ✅ Stop Medication
export const stopMedication = async (req, res) => {
  try {
    const token = req.token;
    const { medicationId } = req.body;

    if (!medicationId) {
      return res.status(400).json({
        success: false,
        message: "medicationId is required",
      });
    }

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

    // find specific medication for this patient
    let medication = await Medication.findOne({
      _id: medicationId,
      patient_id: patient._id,
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    // update status to stopped
    medication.status = "Stopped";
    medication.stoppedAt = new Date();
    await medication.save();

    return res.json({
      success: true,
      message: "Medication stopped successfully",
      result: medication,
    });
  } catch (err) {
    console.error("Error in stopMedication:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
