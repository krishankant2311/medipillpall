import Reminder from "../models/reminderModel.js";
import Patient from "../models/patientModel.js"; // patient model import

// ✅ Add Reminder
export const addReminder = async (req, res) => {
  try {
    const token = req.token; // token se patient identify hoga
    const { medicationId, reminderTime, frequency } = req.body;

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

    const reminder = new Reminder({
      patientId: patient._id,
      medicationId,
      reminderTime,
      frequency,
    });

    await reminder.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Reminder added successfully",
      result: reminder,
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

// ✅ Edit Reminder
export const editReminder = async (req, res) => {
  try {
    const token = req.token;
    const { id } = req.params; // reminder id
    const { medicationId, reminderTime, frequency } = req.body;

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

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, patientId: patient._id },
      { medicationId, reminderTime, frequency },
      { new: true }
    );

    if (!reminder) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Reminder not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Reminder updated successfully",
      result: reminder,
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

// ✅ Get Reminders (list with pagination)
export const getReminders = async (req, res) => {
  try {
    const token = req.token;
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

    const reminders = await Reminder.find({
      patientId: patient._id,
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Reminder.countDocuments({
      patientId: patient._id,
      status: "Active",
    });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Reminder list fetched successfully",
      result: reminders,
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

// ✅ Delete Reminder (soft delete)
export const deleteReminder = async (req, res) => {
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

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, patientId: patient._id },
      { status: "Delete" },
      { new: true }
    );

    if (!reminder) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Reminder not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Reminder deleted successfully",
      result: reminder,
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
