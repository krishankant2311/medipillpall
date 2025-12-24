import Needs from "../models/patientNeedsModel.js";
import Patient from "../models/patientModel.js";




export const addNeedsByPatient = async (req, res) => {
  try {
    const token = req.token; // patient token
    const { title, time, description } = req.body;

    // ✅ Step 1: Validate Patient
    const patient = await Patient.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // ✅ Step 2: Create Need Entry
    const need = await Needs.create({
      title,
      time,
      description,
      date: new Date(),
      patientId: token._id,
    });

    return res.status(201).json({
      success: true,
      message: "Needs added successfully",
      data: need,
    });
  } catch (error) {
    console.log("Add Needs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const editNeedsByPatient = async (req, res) => {
  try {
    const token = req.token; // patient token
    const { needsId } = req.params;
    const { title, time, description } = req.body;

    // ✅ Step 1: Validate Patient
    const patient = await Patient.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // ✅ Step 2: Validate Needs Entry Owned By Patient
    const need = await Needs.findOne({
      _id: needsId,
      patientId: token._id,
      status: "Active",
    });

    if (!need) {
      return res.status(404).json({
        success: false,
        message: "No needs entry found for this patient",
      });
    }

    // ✅ Step 3: Update Fields
    if (title) need.title = title;
    if (time) need.time = time;
    if (description) need.description = description;

    await need.save();

    return res.status(200).json({
      success: true,
      message: "Needs updated successfully",
      data: need,
    });
  } catch (error) {
    console.log("Edit Needs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllNeedsByPatient = async (req, res) => {
  try {
    const token = req.token; // patient token
    // ✅ Step 1: Validate Patient
    const patient = await Patient.findOne({
      _id: token._id,
      status: "Active",
    }); 
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }
    // ✅ Step 2: Fetch Needs Entries
    const needs = await Needs.find({
      patientId: patient._id,
      status: { $ne: "Deleted" },
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "All needs fetched successfully",
      data: needs,
    });
  } catch (error) {
    console.log("Get All Needs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getNeedsDetailsByPatient = async (req, res) => {
  try {
    const token = req.token; // patient token
    const { id } = req.params;
    // ✅ Step 1: Validate Patient
    const patient = await Patient.findOne({
      _id: token._id, 
      status: "Active",
    });
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found or inactive",
      }); 
    }
    // ✅ Step 2: Fetch Needs Entry Details
    const need = await Needs.findOne({
      _id: id,
      patientId: patient._id,
      status: { $ne: "Deleted" },
    });
    if (!need) {
      return res.status(404).json({
        success: false,
        message: "Needs entry not found",
      });
    } 
    return res.status(200).json({
      success: true,
      message: "Needs details fetched successfully",
      data: need,
    });
  }
  catch (error) {
    console.log("Get Needs Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


