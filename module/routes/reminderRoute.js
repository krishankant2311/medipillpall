import express from "express";
import {
  addReminder,
  editReminder,
  getReminders,
  deleteReminder,
} from "../controllers/reminderController.js";
import { verifyAccessToken } from "../../helpers/jwt.js"; // token check middleware

const router = express.Router();

// ➕ Add Reminder
router.post("/add", verifyAccessToken, addReminder);

// ✏️ Edit Reminder
router.post("/edit/:id", verifyAccessToken, editReminder);

// 📋 Get Reminders (list with pagination)
router.get("/list", verifyAccessToken, getReminders);

// ❌ Delete Reminder
router.post("/delete/:id", verifyAccessToken, deleteReminder);

export default router;
