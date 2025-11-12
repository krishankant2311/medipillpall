import express from "express";
import { addMealAndDiet } from "../controllers/mealAndDietController.js";
import {verifyAccessToken} from "../../helpers/jwt.js";
import upload from "../../config/multer.js"; // 🔹 yahi tera existing multer import hoga

const router = express.Router();

// 🥗 Route: Add Meal / Diet by Caretaker
router.post("/addMealAndDiet/:patientId", verifyAccessToken,upload.single("file"), addMealAndDiet);

export default router;
