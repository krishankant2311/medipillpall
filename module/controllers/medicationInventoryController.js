import MedicationInventory from "../models/medicationInventoryModel.js";
import Patient from "../models/patientModel.js";
import Caretaker from "../models/caretakerModel/caretakerModel.js";

// ✅ 1. Add Medication Inventory (for patient or caretaker)
export const addMedicationInventory = async (req, res) => {
  try {
    const token = req.token;
    const { medicationName, dosage, currentStockQuantity, lowStockAlertLevel, stockStatus, patientId, notes } = req.body;

    // Validation
    if (!medicationName || !currentStockQuantity) {
      return res.status(400).json({
        success: false,
        message: "Medication name and current stock quantity are required.",
      });
    }

    let addedByRole;
    let targetPatientId = patientId;

    // Determine who is adding
    if (token.role === "Patient") {
      addedByRole = "Patient";
      targetPatientId = token._id;
    } else if (token.role === "Caretaker") {
      addedByRole = "Caretaker";
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: "Patient ID is required when caretaker adds medication.",
        });
      }
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // Create record
    const newMedication = await MedicationInventory.create({
      addedByRole,
      caretakerId: addedByRole === "Caretaker" ? token._id : null,
      patientId: targetPatientId,
      medicationName,
      dosage,
      currentStockQuantity,
      lowStockAlertLevel,
      stockStatus,
      notes,
    });

    return res.status(200).json({
      success: true,
      message: "Medication inventory added successfully.",
      result: newMedication,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error.",
    });
  }
};

export const addMedicationByPatient = async (req, res) => {
  try {
    const token = req.token; // patient token
    const {
      medicationName,
      dosage,
      currentStockQuantity,
      lowStockAlertLevel
    } = req.body;

    // 🔹 Validation: check required fields
    if (!medicationName) {
      return res.status(400).json({
        success: false,
        message: "Medication name is required."
      });
    }

    if (currentStockQuantity === undefined || currentStockQuantity === null) {
      return res.status(400).json({
        success: false,
        message: "Current stock quantity is required."
      });
    }

    // 🔹 Validate patient existence
    const patient = await Patient.findById(token._id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found."
      });
    }

    // 🔹 Create new record
    const newMedication = await MedicationInventory.create({
      medicationName,
      dosage,
      currentStockQuantity,
      lowStockAlertLevel,
      addedBy: "Patient",
      patientId: patient._id
    });

    // 🔹 Success response
    return res.status(200).json({
      success: true,
      message: "Medication added successfully by patient.",
      result: newMedication
    });

  } catch (error) {
    console.error("Add Medication (Patient) Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const addMedicationByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const {
      
      medicationName,
      dosage,
      currentStockQuantity,
      lowStockAlertLevel,
      stockStatus,
      notes
    } = req.body;
    const { patientId } = req.params;
    // 🔹 Validation: check required fields
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required."
      });
    }

    if (!medicationName) {
      return res.status(400).json({
        success: false,
        message: "Medication name is required."
      });
    }

    if (currentStockQuantity === undefined || currentStockQuantity === null) {
      return res.status(400).json({
        success: false,
        message: "Current stock quantity is required."
      });
    }

    // 🔹 Validate caretaker existence
    const caretaker = await Caretaker.findById(token._id);

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: "Caregiver not found."
      });
    }

    // 🔹 Validate patient existence
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found."
      });
    }

    // 🔹 Create new record
    const newMedication = await MedicationInventory.create({
      medicationName,
      dosage,
      currentStockQuantity,
      lowStockAlertLevel,
      stockStatus,
      notes,
      addedByRole: "Caretaker",
      caretakerId: caretaker._id,
      patientId: patient._id
    });

    // 🔹 Success response
    return res.status(200).json({
      success: true,
      message: "Medication added successfully by caregiver.",
      result: newMedication
    });

  } catch (error) {
    console.error("Add Medication (Caregiver) Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ 2. Get All Medication Inventories (for patient or caretaker)
export const getAllMedicationInventory = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.query;

    let filter = { isDeleted: false };

    if (token.role === "Patient") {
      filter.patientId = token._id;
    } else if (token.role === "Caretaker") {
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: "Patient ID is required to view medication inventory.",
        });
      }
      filter.patientId = patientId;
    }

    const medications = await MedicationInventory.find(filter)
      .populate("patientId", "fullName age gender")
      .populate("caretakerId", "fullName mobileNumber");

    return res.status(200).json({
      success: true,
      message: "Medication inventories fetched successfully.",
      result: medications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error.",
    });
  }
};

// ✅ 3. Soft Delete Medication
export const softDeleteMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;

    const medication = await MedicationInventory.findById(medicationId);
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found.",
      });
    }

    medication.isDeleted = true;
    await medication.save();

    return res.status(200).json({
      success: true,
      message: "Medication soft deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error.",
    });
  }
};


export const getAllMedicationByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params; // patientId from query

    // 🔹 Validate caretaker existence
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active"
    });

    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid caregiver."
      });
    }

    // 🔹 Validate patientId
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required."
      });
    }

    // 🔹 Validate patient existence
    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active"
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found."
      });
    }

    // 🔹 Fetch medications for that patient (added by caretaker)
    const records = await MedicationInventory.find({
      caretakerId: caretaker._id,
      patientId: patient._id
    })
    .populate("patientId", "fullName age gender")
      .sort({ createdAt: -1 });

    // 🔹 If no data found
    if (!records.length) {
      return res.status(200).json({
        success: true,
        message: "No medication records found for this patient.",
        result: []
      });
    }

    // 🔹 Success response
    return res.status(200).json({
      success: true,
      message: "Medication records fetched successfully.",
      result: records
    });

  } catch (error) {
    console.error("Get Medication (Caregiver) Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
