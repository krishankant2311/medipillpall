import express from "express";
import { addMealAndDiet,getAllMealAndDiet,deleteMealAndDiet } from "../controllers/mealAndDietController.js";
import {verifyAccessToken} from "../../helpers/jwt.js";
import upload from "../../config/multer.js"; // 🔹 yahi tera existing multer import hoga

const router = express.Router();

// 🥗 Route: Add Meal / Diet by Caretaker
router.post("/addMealAndDiet/:patientId", verifyAccessToken,upload.array("mealPhoto", 10), addMealAndDiet);
// 🥗 Route: Get All Meals and Diets by Caretaker for a Patient
router.get("/getAllMealAndDiet/:patientId", verifyAccessToken, getAllMealAndDiet);
// 🥗 Route: Delete Meal / Diet by Caretaker
router.delete("/deleteMealAndDiet/:id", verifyAccessToken, deleteMealAndDiet);

export default router;
