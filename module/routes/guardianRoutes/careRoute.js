import express from "express";
import {
  addCareNote,
  getAllCareNotes,
  getCareNoteById,
  updateCareNote,
  deleteCareNote,
} from "../../controllers/guardianController/careController.js"; // path adjust karo

const router = express.Router();

import { verifyAccessToken } from "../../../helpers/jwt.js";  
import upload from "../../../config/multer.js";
// 1️⃣ Add CareNote
router.post("/addCareNote", verifyAccessToken,upload.none(), addCareNote);

// 2️⃣ Get All CareNotes
router.get("/careNotes" ,verifyAccessToken, getAllCareNotes);

// 3️⃣ Get CareNote by ID
router.get("/careNote/:id" ,verifyAccessToken, getCareNoteById);

// 4️⃣ Update CareNote by ID
router.post("/careNote/:id", verifyAccessToken,upload.none(), updateCareNote);

// 5️⃣ Delete CareNote by ID (soft delete)
router.post("/careNote/:id" ,verifyAccessToken,upload.none(), deleteCareNote);

export default router;
