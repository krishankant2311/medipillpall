import express from "express";
import {
  addDietInstruction,
  editDietInstruction,
  getDietInstructions,
  deleteDietInstruction,
} from "../controllers/parientDietController.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js";

const router = express.Router();


router.post("/add-diet-instruction", verifyAccessToken,upload.none(), addDietInstruction);

router.post("/edit-diet-instruction/:dietId", verifyAccessToken,upload.none(), editDietInstruction);

router.get("/get-diet-instructions", verifyAccessToken, getDietInstructions);

router.post("/delete-diet-instruction/:dietId", verifyAccessToken,upload.none(), deleteDietInstruction);

export default router;
