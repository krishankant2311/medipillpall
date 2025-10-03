import Activity from "../models/patientActivityModel.js";
import Patient from "../models/patientModel.js";

// ✅ Add Activity
export const addActivity = async (req, res) => {
  try {
    let token = req.token;
    const { activityType, duration, details, status, caretakerId } = req.body;

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const newActivity = new Activity({
      patientId: patient._id,
      caretakerId,
      activityType,
      duration,
      details,
      status,
    });

    await newActivity.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Activity added successfully",
      result: newActivity,
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

// ✅ Edit Activity
export const editActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { activityType, duration, details, status } = req.body;

    let token = req.token;
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const activity = await Activity.findOne({ _id: activityId });
    if (!activity) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Activity not found",
        result: {},
      });
    }

    if (activity.patientId.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to edit this activity",
        result: {},
      });
    }

    activity.activityType = activityType || activity.activityType;
    activity.duration = duration || activity.duration;
    activity.details = details || activity.details;
    activity.status = status || activity.status;

    await activity.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Activity updated successfully",
      result: activity,
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

// ✅ Get Activities with pagination
export const getActivities = async (req, res) => {
  try {
    let token = req.token;
    let { page = 1, limit = 10, patientId } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = {};

    if (patientId) {
      query.patientId = patientId;
    } else {
      const patient = await Patient.findOne({ _id: token._id, status: "Active" });
      if (!patient) {
        return res.send({
          statusCode: 401,
          success: false,
          message: "Invalid patient token",
          result: {},
        });
      }
      query.patientId = patient._id;
    }

    const activities = await Activity.find(query)
      .populate("patientId")
      .populate("caretakerId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Activity.countDocuments(query);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Activities fetched successfully",
      result: activities,
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

// ✅ Get All Activities (no pagination)
export const getAllActivities = async (req, res) => {
  try {
    let token = req.token;
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });

    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const activities = await Activity.find({ patientId: patient._id })
      .populate("patientId")
      .populate("caretakerId")
      .sort({ createdAt: -1 });

    return res.send({
      statusCode: 200,
      success: true,
      message: "All activities fetched successfully",
      result: activities,
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

// ✅ Delete Activity (soft delete)
export const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    let token = req.token;

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Activity not found",
        result: {},
      });
    }

    if (activity.patientId.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to delete this activity",
        result: {},
      });
    }

    activity.status = "Delete"; // or "Deleted" if you want soft delete like Meal
    await activity.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Activity marked as completed successfully",
      result: activity,
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
