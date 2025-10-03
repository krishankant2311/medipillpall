import express from "express";
import {
  addMeal,
  editMeal,
  getMeals,
  getAllMealsByAdmin,
  deleteMeal,
} from "../controllers/patientMealController.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js";
const router = express.Router();

// ✅ Add a new meal
router.post("/add", verifyAccessToken,upload.none(), addMeal);

// ✅ Edit a meal
router.post("/edit/:mealId", verifyAccessToken,upload.none(), editMeal);

// ✅ Get meals with pagination
router.get("/list", verifyAccessToken, getMeals);

// ✅ Get all meals (no pagination)
router.get("/all", verifyAccessToken, getAllMealsByAdmin);

// ✅ Delete a meal (soft delete)
router.post("/delete/:mealId", verifyAccessToken,upload.none(), deleteMeal);

export default router;
