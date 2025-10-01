import express from "express";
import {
  addActivity,
  editActivity,
  getActivities,
  getAllActivities,
  deleteActivity,
} from "../controllers/patientActivityController.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js";

const router = express.Router();

// ✅ Add a new activity
router.post("/add", verifyAccessToken,upload.none(), addActivity);

// ✅ Edit an existing activity
router.post("/edit/:activityId", verifyAccessToken,upload.none(), editActivity);

// ✅ Get activities with pagination
router.get("/list", verifyAccessToken, getActivities);

// ✅ Get all activities (no pagination)
router.get("/all", verifyAccessToken, getAllActivities);

// ✅ Delete an activity (soft delete)
router.post("/delete/:activityId", verifyAccessToken,upload.none(), deleteActivity);

export default router;
