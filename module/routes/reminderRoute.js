import express from "express";
import {
  addReminder,
  editReminder,
  getReminders,
  deleteReminder,
  getMedicalReportByIdbypatient,
} from "../controllers/reminderController.js";
import { verifyAccessToken } from "../../helpers/jwt.js"; // token check middleware
import upload from "../../config/multer.js";
const router = express.Router();

// ➕ Add Reminder
router.post("/add", verifyAccessToken,upload.none(), addReminder);

// ✏️ Edit Reminder
router.post("/edit/:id", verifyAccessToken,upload.none(), editReminder);

// 📋 Get Reminders (list with pagination)
router.get("/list", verifyAccessToken, getReminders);

// ❌ Delete Reminder
router.post("/delete/:id", verifyAccessToken, deleteReminder);

router.get("/getMedicalReportByIdbypatient/:reminderId", verifyAccessToken, getMedicalReportByIdbypatient);

export default router;
