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
    const { day, amBP, pmBP, comments } = req.body;
   const token = req.token;
    const patient_id = token._id;
    // if (!patient_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "patient_id required",
    //   });
    // }

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
    const {  day, before, after, insulinDose, notes } = req.body;
 const   token = req.token;
    const patient_id = token._id;
    // if (!patient_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "patient_id required",
    //   });
    // }

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
    const {  day, time, amTemp, pmTemp, notes } = req.body;

    // if (!patient_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "patient_id required",
    //   });
    // }

    const   token = req.token;
    const patient_id = token._id;

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
    const {  day, weight } = req.body;

    // if (!patient_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "patient_id required",
    //   });
    // }

    const   token = req.token;
    const patient_id = token._id;

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
    const {  day, time, amRate, pmRate, notes } = req.body;

    // if (!patient_id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "patient_id required",
    //   });
    // }

    const   token = req.token;
    const patient_id = token._id;
    
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

// -------------------- GET BLOOD PRESSURE --------------------
// export const getPatientBloodPressure = async (req, res) => {
//   try {
//     const token = req.token;

//     if (!token || !token._id) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }

//     const { start, end } = getDateRange(new Date());

//     const record = await PatientRecord.findOne({
//       patient_id: token._id,
//       createdAt: { $gte: start, $lte: end },
//     }).select("bloodPressure createdAt").sort({ createdAt: -1 });

//     if (!record || !record.bloodPressure) {
//       return res.json({
//         success: true,
//         message: "No blood pressure record found for today",
//         result: {},
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Blood Pressure fetched successfully",
//       result: record.bloodPressure,
//     });
//   } catch (err) {
//     console.error("Error in getPatientBloodPressure:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// // -------------------- GET BLOOD SUGAR --------------------
// export const getPatientBloodSugar = async (req, res) => {
//   try {
//     const token = req.token;

//     if (!token || !token._id) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }

//     const { start, end } = getDateRange(new Date());

//     const record = await PatientRecord.findOne({
//       patient_id: token._id,
//       createdAt: { $gte: start, $lte: end },
//     }).sort({ createdAt: -1 }).select("bloodSugar createdAt");

//     if (!record || !record.bloodSugar) {
//       return res.json({
//         success: true,
//         message: "No blood sugar record found for today",
//         result: {},
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Blood Sugar fetched successfully",
//       result: record.bloodSugar,
//     });
//   } catch (err) {
//     console.error("Error in getPatientBloodSugar:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// // -------------------- GET BODY TEMPERATURE --------------------
// export const getPatientBodyTemp = async (req, res) => {
//   try {
//     const token = req.token;

//     if (!token || !token._id) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }

//     const { start, end } = getDateRange(new Date());

//     const record = await PatientRecord.findOne({
//       patient_id: token._id,
//       createdAt: { $gte: start, $lte: end },
//     }).select("bodyTemp createdAt");

//     if (!record || !record.bodyTemp) {
//       return res.json({
//         success: true,
//         message: "No body temperature record found for today",
//         result: {},
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Body Temperature fetched successfully",
//       result: record.bodyTemp,
//     });
//   } catch (err) {
//     console.error("Error in getPatientBodyTemp:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// // -------------------- GET BODY WEIGHT --------------------
// export const getPatientBodyWeight = async (req, res) => {
//   try {
//     const token = req.token;

//     if (!token || !token._id) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }

//     const { start, end } = getDateRange(new Date());

//     const record = await PatientRecord.findOne({
//       patient_id: token._id,
//       createdAt: { $gte: start, $lte: end },
//     }).select("bodyWeight createdAt");

//     if (!record || !record.bodyWeight) {
//       return res.json({
//         success: true,
//         message: "No body weight record found for today",
//         result: {},
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Body Weight fetched successfully",
//       result: record.bodyWeight,
//     });
//   } catch (err) {
//     console.error("Error in getPatientBodyWeight:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// // -------------------- GET HEART RATE --------------------
// export const getPatientHeartRate = async (req, res) => {
//   try {
//     const token = req.token;

//     if (!token || !token._id) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }

//     const { start, end } = getDateRange(new Date());

//     const record = await PatientRecord.findOne({
//       patient_id: token._id,
//       createdAt: { $gte: start, $lte: end },
//     }).select("heartRate createdAt");

//     if (!record || !record.heartRate) {
//       return res.json({
//         success: true,
//         message: "No heart rate record found for today",
//         result: {},
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Heart Rate fetched successfully",
//       result: record.heartRate,
//     });
//   } catch (err) {
//     console.error("Error in getPatientHeartRate:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };
export const getPatientBloodPressure = async (req, res) => {
  try {
    const token = req.token;
console.log("Token ID:", token._id);

    // 🔹 Validate patient
    const patient = await Patient.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive patient",
      });
    }

    // 🔹 Last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 🔹 Fetch BP records from last 24 hours
    const records = await PatientRecord.find({
      patient_id: token._id,
      createdAt: { $gte: last24h },
    })
      .select("bloodPressure createdAt")
      .sort({ createdAt: -1 });

    if (!records.length) {
      return res.json({
        success: true,
        message: "No blood pressure record available in the last 24 hours",
        result: [],
      });
    }

    // 🔹 Flatten bloodPressure for response
    const finalResult = records.map((r) => ({
      _id: r._id,
      day: r.bloodPressure?.day || "",
      amBP: r.bloodPressure?.amBP || "",
      pmBP: r.bloodPressure?.pmBP || "",
      comments: r.bloodPressure?.comments || "",
      createdAt: r.createdAt,
    }));

    return res.json({
      success: true,
      message: "Blood pressure fetched successfully for the last 24 hours",
      result: finalResult,
    });

  } catch (err) {
    console.error("Patient BP Fetch Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};



export const getPatientBloodSugar = async (req, res) => {
  try {
    const token = req.token;

    if (!token || !token._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const { start, end } = getDateRange(new Date());

    const record = await PatientRecord.findOne({
      patient_id: token._id,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }).select("bloodSugar createdAt");

    // ✔ Same missing-data logic applied
    if (
      !record ||
      !record.bloodSugar ||
      (!record.bloodSugar.day &&
        !record.bloodSugar.fasting &&
        !record.bloodSugar.random &&
        !record.bloodSugar.comments)
    ) {
      return res.json({
        success: true,
        message: "No blood sugar record found for today",
        result: {},
      });
    }

    return res.json({
      success: true,
      message: "Blood Sugar fetched successfully",
      result: record.bloodSugar,
    });
  } catch (err) {
    console.error("Error in getPatientBloodSugar:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const getPatientBodyTemp = async (req, res) => {
  try {
    const token = req.token;

    if (!token || !token._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const { start, end } = getDateRange(new Date());

    const record = await PatientRecord.findOne({
      patient_id: token._id,
      createdAt: { $gte: start, $lte: end },
    }).select("bodyTemp createdAt");

    // ✔ Same missing-data logic
    if (
      !record ||
      !record.bodyTemp ||
      (!record.bodyTemp.day &&
        !record.bodyTemp.morning &&
        !record.bodyTemp.evening &&
        !record.bodyTemp.comments)
    ) {
      return res.json({
        success: true,
        message: "No body temperature record found for today",
        result: {},
      });
    }

    return res.json({
      success: true,
      message: "Body Temperature fetched successfully",
      result: record.bodyTemp,
    });
  } catch (err) {
    console.error("Error in getPatientBodyTemp:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
export const getPatientBodyWeight = async (req, res) => {
  try {
    const token = req.token;

    if (!token || !token._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const { start, end } = getDateRange(new Date());

    const record = await PatientRecord.findOne({
      patient_id: token._id,
      createdAt: { $gte: start, $lte: end },
    }).select("bodyWeight createdAt");

    // ✔ Same missing-data logic
    if (
      !record ||
      !record.bodyWeight ||
      (!record.bodyWeight.day &&
        !record.bodyWeight.weight &&
        !record.bodyWeight.comments)
    ) {
      return res.json({
        success: true,
        message: "No body weight record found for today",
        result: {},
      });
    }

    return res.json({
      success: true,
      message: "Body Weight fetched successfully",
      result: record.bodyWeight,
    });
  } catch (err) {
    console.error("Error in getPatientBodyWeight:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
export const getPatientHeartRate = async (req, res) => {
  try {
    const token = req.token;

    if (!token || !token._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const { start, end } = getDateRange(new Date());

    const record = await PatientRecord.findOne({
      patient_id: token._id,
      createdAt: { $gte: start, $lte: end },
    }).select("heartRate createdAt");

    // ✔ Same missing-data logic
    if (
      !record ||
      !record.heartRate ||
      (!record.heartRate.day &&
        !record.heartRate.rate &&
        !record.heartRate.comments)
    ) {
      return res.json({
        success: true,
        message: "No heart rate record found for today",
        result: {},
      });
    }

    return res.json({
      success: true,
      message: "Heart Rate fetched successfully",
      result: record.heartRate,
    });
  } catch (err) {
    console.error("Error in getPatientHeartRate:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// -------------------- EDIT BLOOD PRESSURE --------------------
export const editPatientBloodPressures = async (req, res) => {
  try {
    // Step 1: Validate token
    const token = req.token;
    if (!token || !token._id) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: "Invalid token",
        result: {},
      });
    }

    // Step 2: Extract body
    const { day, amBP, pmBP, comments } = req.body;

    // Step 3: Validate input
    if (!day && !amBP && !pmBP && !comments) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "At least one field is required to update (day, amBP, pmBP, comments)",
        result: {},
      });
    }

    // Step 4: Find today’s record
    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: token._id,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No patient record found for today",
        result: {},
      });
    }

    // Step 5: Update existing bloodPressure
    record.bloodPressure = {
      ...record.bloodPressure?.toObject?.() || record.bloodPressure || {},
      ...(day && { day }),
      ...(amBP && { amBP }),
      ...(pmBP && { pmBP }),
      ...(comments && { comments }),
    };
    await record.save();

    // Step 6: Return response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Blood Pressure updated successfully",
      result: record.bloodPressure,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

export const editPatientBloodPressure = async (req, res) => {
  try {
    const token = req.token;
    const { day, amBP, pmBP, comments } = req.body;

    // --- Validate token ---
    if (!token || !token._id) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: "Invalid token",
        result: {},
      });
    }

    // --- Validate at least one field ---
    if (!day && !amBP && !pmBP && !comments) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message:
          "At least one field is required to update (day, amBP, pmBP, comments)",
        result: {},
      });
    }

    // --- Build update object dynamically ---
    const updateFields = {};
    if (day) updateFields.day = day;
    if (amBP) updateFields.amBP = amBP;
    if (pmBP) updateFields.pmBP = pmBP;
    if (comments) updateFields.comments = comments;

    // --- Update record ---
    const record = await PatientRecord.findOneAndUpdate(
      { patient_id: token._id },
      { $set: updateFields },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Record not found for this patient",
        result: {},
      });
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Blood pressure updated successfully",
      result: record,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};


// -------------------- EDIT BODY TEMPERATURE --------------------
export const editPatientBodyTemp = async (req, res) => {
  try {
    const token = req.token;
    if (!token || !token._id) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: "Invalid token",
        result: {},
      });
    }

    const { day, time, amTemp, pmTemp, notes } = req.body;

    if (!day && !time && !amTemp && !pmTemp && !notes) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "At least one field is required to update (day, time, amTemp, pmTemp, notes)",
        result: {},
      });
    }

    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: token._id,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No patient record found for today",
        result: {},
      });
    }

    record.bodyTemp = {
      ...record.bodyTemp?.toObject?.() || record.bodyTemp || {},
      ...(day && { day }),
      ...(time && { time }),
      ...(amTemp && { amTemp }),
      ...(pmTemp && { pmTemp }),
      ...(notes && { notes }),
    };
    await record.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Body Temperature updated successfully",
      result: record.bodyTemp,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// -------------------- EDIT HEART RATE --------------------
export const editPatientHeartRate = async (req, res) => {
  try {
    const token = req.token;
    if (!token || !token._id) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: "Invalid token",
        result: {},
      });
    }

    const { day, time, amRate, pmRate, notes } = req.body;

    if (!day && !time && !amRate && !pmRate && !notes) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "At least one field is required to update (day, time, amRate, pmRate, notes)",
        result: {},
      });
    }

    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: token._id,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No patient record found for today",
        result: {},
      });
    }

    record.heartRate = {
      ...record.heartRate?.toObject?.() || record.heartRate || {},
      ...(day && { day }),
      ...(time && { time }),
      ...(amRate && { amRate }),
      ...(pmRate && { pmRate }),
      ...(notes && { notes }),
    };
    await record.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Heart Rate updated successfully",
      result: record.heartRate,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// -------------------- EDIT BODY WEIGHT --------------------
export const editPatientBodyWeight = async (req, res) => {
  try {
    const token = req.token;
    if (!token || !token._id) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: "Invalid token",
        result: {},
      });
    }

    const { day, weight } = req.body;

    if (!day && !weight) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "At least one field is required to update (day or weight)",
        result: {},
      });
    }

    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: token._id,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No patient record found for today",
        result: {},
      });
    }

    record.bodyWeight = {
      ...record.bodyWeight?.toObject?.() || record.bodyWeight || {},
      ...(day && { day }),
      ...(weight && { weight }),
    };
    await record.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Body Weight updated successfully",
      result: record.bodyWeight,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

