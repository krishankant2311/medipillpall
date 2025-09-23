import PatientRecord from "../models/patientRecordModel.js";
import Patient from "../models/patientModel.js";
// import { message } from "statuses";

const getDateRange = (date = new Date()) => {
  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(date.setHours(23, 59, 59, 999));
  return { start, end };
};

export const addPatientBloodPressure = async (req, res) => {
  try {
    const { patient_id, day, amBP, pmBP, comments } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id required",
      });
    }

    if (!day || !amBP || !pmBP) {
      return res.status(400).json({
        success: false,
        message: "day, amBP and pmBP are required",
      });
    }

    // same patient_id ke liye same date ka document dhoondo
    const { start, end } = getDateRange(new Date());

    let record = await PatientRecord.findOne({
      patient_id,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      // agar record hai → update bloodPressure
      record.bloodPressure = { day, amBP, pmBP, comments };
      await record.save();
    } else {
      // agar record nahi hai → new create
      record = await PatientRecord.create({
        patient_id,
        bloodPressure: { day, amBP, pmBP, comments },
      });
       await record.save();

    }

    return res.json({
      success: true,
      message: "Blood Pressure added/updated successfully",
      result: record,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const addPatientBloodSugar = async (req, res) => {
  try {
    const { patient_id, day, before, after, insulinDose, notes } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id required",
      });
    }

    if (!day || !before || !after) {
      return res.status(400).json({
        success: false,
        message: "day, before and after sugar values are required",
      });
    }

    // same patient_id ke liye same date ka record dhoondo
    const { start, end } = getDateRange(new Date());

    let record = await PatientRecord.findOne({
      patient_id,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      // agar record hai → update bloodSugar
      record.bloodSugar = { day, before, after, insulinDose, notes };
      await record.save();
    } else {
      // agar record nahi hai → new create
      record = await PatientRecord.create({
        patient_id,
        bloodSugar: { day, before, after, insulinDose, notes },
      });
       await record.save();

    }

    return res.json({
      success: true,
      message: "Blood Sugar added/updated successfully",
      result: record,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const addPatientBodyTemp = async (req, res) => {
  try {
    const { patient_id, day, time, amTemp, pmTemp, notes } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id required",
      });
    }

    if (!day) {
      return res.status(400).json({
        success: false,
        message: "day is required",
      });
    }

    // Find if record already exists for same patient & today's date
    const { start, end } = getDateRange(new Date());

    let record = await PatientRecord.findOne({
      patient_id,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      // Update existing record
      record.bodyTemp = { day, time, amTemp, pmTemp, notes };
      await record.save();
    } else {
      // Create new record
      record = await PatientRecord.create({
        patient_id,
        bodyTemp: { day, time, amTemp, pmTemp, notes },
        
      });
           await record.save()

    }
    return res.json({
      success: true,
      message: "Body Temperature added/updated successfully",
      result: record,
    });

  } catch (err) {
    console.error("Error in addPatientBodyTemp:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const addPatientBodyWeight = async (req, res) => {
  try {
    const { patient_id, day, weight } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id required",
      });
    }

    if (!day || !weight) {
      return res.status(400).json({
        success: false,
        message: "day and weight are required",
      });
    }

    // find record for same patient & today's date
    const { start, end } = getDateRange(new Date());

    let record = await PatientRecord.findOne({
      patient_id,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      // update bodyWeight in existing record
      record.bodyWeight = { day, weight };
      await record.save();
    } else {
      // create new record
      record = await PatientRecord.create({
        patient_id,
        bodyWeight: { day, weight },
      });
       await record.save();

    }
//  await record.save();
    return res.json({
      success: true,
      message: "Body Weight added/updated successfully",
      result: record,
    });

  } catch (err) {
    console.error("Error in addPatientBodyWeight:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const addPatientHeartRate = async (req, res) => {
  try {
    const { patient_id, day, time, amRate, pmRate, notes } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id required",
      });
    }

    if (!day) {
      return res.status(400).json({
        success: false,
        message: "day is required",
      });
    }

    // check if record already exists for same patient & today
    const { start, end } = getDateRange(new Date());

    let record = await PatientRecord.findOne({
      patient_id,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      // update existing record
      record.heartRate = { day, time, amRate, pmRate, notes };
      await record.save();
    } else {
      // create new record
      record = await PatientRecord.create({
        patient_id,
        heartRate: { day, time, amRate, pmRate, notes },
      });
    }

    return res.json({
      success: true,
      message: "Heart Rate added/updated successfully",
      result: record,
    });

  } catch (err) {
    console.error("Error in addPatientHeartRate:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
