import Task from "../models/patientTaskModel.js";
import Patient from "../models/patientModel.js"; // assuming Patient schema exists

// Add Task
export const addTask = async (req, res) => {
  try {
    const { title, time, type } = req.body;
    const token = req.token; // token se patient identify hoga

    if (!title) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Task title is required",
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

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    const newTask = new Task({
      patient_id: token._id,
      title,
      time,
      type,
    });

    await newTask.save();

    return res.send({
      statusCode: 201,
      success: true,
      message: "Task added successfully",
      result: newTask,
    });
  } catch (error) {
    console.error("Error in addTask:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Edit Task
export const editTask = async (req, res) => {
  try {
    const { taskId, title, time, type, status } = req.body;
    const token = req.token;

    if (!taskId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "taskId is required",
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

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, patient_id: token._id },
      { title, time, type, status },
      { new: true }
    );

    if (!updatedTask) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Task not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Task updated successfully",
      result: updatedTask,
    });
  } catch (error) {
    console.error("Error in editTask:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const token = req.token;

    if (!taskId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "taskId is required",
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

    const deletedTask = await Task.findOneAndDelete({ _id: taskId, patient_id: token._id });

    if (!deletedTask) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Task not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Task deleted successfully",
      result: deletedTask,
    });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Get Single Task
export const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const token = req.token;

    if (!taskId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "taskId is required",
        result: {},
      });
    }

    const task = await Task.findOne({ _id: taskId, patient_id: token._id });

    if (!task) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Task not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Task fetched successfully",
      result: task,
    });
  } catch (error) {
    console.error("Error in getTask:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Get All Tasks
export const getAllTasks = async (req, res) => {
  try {
    const token = req.token;

    const tasks = await Task.find({ patient_id: token._id }).sort({ createdAt: -1 });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tasks fetched successfully",
      result: tasks,
    });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
