import express from "express";
import { addCaretaker, getAllCaretakersByAdmin } from "../../controllers/caretakerController/caretakerController.js";
import { verifyAccessToken } from "../../../helpers/jwt.js"; // token verify middleware
import upload from "../../../config/multer.js";
const router = express.Router();

// Add caretaker (Admin or open based on your requirement)
// Agar sirf admin hi add kar sakta hai, use verifyAccessToken middleware
router.post("/add", verifyAccessToken,upload.none(), addCaretaker);

// Get all caretakers (Admin only)
router.get("/get-all", verifyAccessToken, getAllCaretakersByAdmin);

export default router;
