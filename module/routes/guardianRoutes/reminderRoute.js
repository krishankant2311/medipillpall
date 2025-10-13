import express from "express";
import { saveReminder, getReminders,editReminder, getReminderById, deleteReminder } from "../../controllers/guardianController/reminderController.js";
import { verifyAccessToken } from "../../../helpers/jwt.js"; // Guardian authentication middleware
import upload from "../../../config/multer.js"; // Multer configuration for file uploads (if needed)
const router = express.Router();

// ------------------------
// Routes for Reminder API
// ------------------------

// Create or Update Reminder
router.post("/save-reminder", verifyAccessToken,upload.none(), saveReminder);

// Get all Reminders for logged-in Guardian
router.get("/get-guardian-reminder", verifyAccessToken, getReminders);

// Get single Reminder by ID (Guardian can only access own reminders)
router.get("/get-reminder/:id", verifyAccessToken, getReminderById);

// Delete Reminder by ID (Guardian can only delete own reminders)
router.post("/delete/:id", verifyAccessToken, deleteReminder);

// Edit Reminder by ID (Guardian can only edit own reminders)
router.post("/edit-reminder/:id", verifyAccessToken,upload.none(), editReminder);

export default router;
