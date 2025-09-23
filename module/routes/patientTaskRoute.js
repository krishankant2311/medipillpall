import express from "express";
import {
  addTask,
  editTask,
  deleteTask,
  getTask,
  getAllTasks,
} from "../controllers/patientTaskController.js";
import { verifyAccessToken } from "../../helpers/jwt.js"; 
import upload from "../../config/multer.js"; 
const router = express.Router();

// Add Task
router.post("/add", verifyAccessToken, upload.none(), addTask);

// Edit Task
router.put("/edit", verifyAccessToken,upload.none(), editTask);

// Delete Task
router.post("/delete/:taskId", verifyAccessToken,upload.none(), deleteTask);

// Get Single Task
router.get("/get/:taskId", verifyAccessToken, getTask);

// Get All Tasks (paginated)
router.get("/all", verifyAccessToken, getAllTasks);

export default router;
