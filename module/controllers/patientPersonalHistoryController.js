import Patient from "../models/patientModel.js"

import PersonalHistory from "../models/patientPersonalHistoryModel.js";

/**
 * ➤ Add Personal History
 */
export const addPersonalHistory = async (req, res) => {
  try {
    let accessToken = req.token; // middleware me token decode karke `req.token` me dalte ho
    const { title, historyType, description } = req.body;

    if (!title) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Title is required",
        result: {},
      });
    }

    const patient = await Patient.findOne({ accessToken });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const newHistory = new PersonalHistory({
      patient_id: patient._id,
      title,
      historyType,
      description,
    });

    await newHistory.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Personal History added successfully",
      result: newHistory,
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

/**
 * ➤ Edit Personal History
 */
export const editPersonalHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const { title, historyType, description, status } = req.body;

    const updated = await PersonalHistory.findByIdAndUpdate(
      historyId,
      { title, historyType, description, status },
      { new: true }
    );

    if (!updated) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Personal History not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Personal History updated successfully",
      result: updated,
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

/**
 * ➤ Get Personal History by patient_id (with pagination)
 */
export const getPersonalHistory = async (req, res) => {
  try {
    let accessToken = req.token;
    let { page = 1, limit = 10, patientId } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Agar admin patientId bhejta hai to use karo, warna token se identify karo
    let query = {};
    if (patientId) {
      query.patient_id = patientId;
    } else {
      const patient = await Patient.findOne({ accessToken });
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

    const histories = await PersonalHistory.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await PersonalHistory.countDocuments(query);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Personal History fetched successfully",
      result: histories,
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

// export const editPersonalHistory = async (req, res) => {
//   try {
//     const { historyId } = req.params;
//     const { title, historyType, description } = req.body;

//     let accessToken = req.token;
//     const patient = await Patient.findOne({ accessToken });
//     if (!patient) {
//       return res.send({
//         statusCode: 401,
//         success: false,
//         message: "Invalid patient token",
//         result: {},
//       });
//     }

//     // Find history & check ownership
//     const history = await PersonalHistory.findById(historyId);
//     if (!history) {
//       return res.send({
//         statusCode: 404,
//         success: false,
//         message: "Personal History not found",
//         result: {},
//       });
//     }
//     if (history.patient_id.toString() !== patient._id.toString()) {
//       return res.send({
//         statusCode: 403,
//         success: false,
//         message: "Unauthorized to edit this history",
//         result: {},
//       });
//     }

//     history.title = title || history.title;
//     history.historyType = historyType || history.historyType;
//     history.description = description || history.description;

//     await history.save();

//     return res.send({
//       statusCode: 200,
//       success: true,
//       message: "Personal History updated successfully",
//       result: history,
//     });
//   } catch (error) {
//     return res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message,
//       result: {},
//     });
//   }
// };

export const deletePersonalHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    let accessToken = req.token;

    const patient = await Patient.findOne({ accessToken });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const history = await PersonalHistory.findById(historyId);
    if (!history) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Personal History not found",
        result: {},
      });
    }

    if (history.patient_id.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to delete this history",
        result: {},
      });
    }

    history.status = "Delete";
    await history.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Personal History deleted successfully",
      result: history,
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
