import express from "express";
import { addMealAndDiet,getAllMealAndDiet,addMealAndDietByPatient,
    editMealAndDietByCaretaker, deleteMealAndDiet,addRemarksByCaretaker,updateStatusByCaregiver } from "../controllers/mealAndDietController.js";
import {verifyAccessToken} from "../../helpers/jwt.js";
import upload from "../../config/multer.js"; // 🔹 yahi tera existing multer import hoga

const router = express.Router();

// 🥗 Route: Add Meal / Diet by Caretaker
router.post("/addMealAndDiet/:patientId", verifyAccessToken,upload.array("mealPhoto", 10), addMealAndDiet);
// 🥗 Route: Get All Meals and Diets by Caretaker for a Patient
router.get("/getAllMealAndDiet/:patientId", verifyAccessToken, getAllMealAndDiet);
// 🥗 Route: Delete Meal / Diet by Caretaker
router.post("/deleteMealAndDiet/:id", verifyAccessToken, deleteMealAndDiet);
// 🥗 Route: Edit Meal / Diet by Caretaker
router.post("/editMealAndDietByCaretaker/:mealId", verifyAccessToken,upload.array("mealPhoto", 10), editMealAndDietByCaretaker);
// 🥗 Route: Add Meal / Diet by Patient
router.post("/addMealAndDietByPatient", verifyAccessToken,upload.array("mealPhoto", 10), addMealAndDietByPatient);

// 🥗 Route: Add Remarks by Caretaker
router.post("/addRemarksByCaretaker/:mealandDietId",upload.none(), verifyAccessToken, addRemarksByCaretaker);
router.post("/updatestatus/:mealandDietId",upload.none(), verifyAccessToken, updateStatusByCaregiver);



export default router;
