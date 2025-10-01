import express from "express";
import { addGuardian, getAllGuardiansByAdmin } from "../../controllers/guardianController/guardianController.js";
import { verifyAccessToken } from "../../../helpers/jwt.js";
import upload from "../../../config/multer.js";
const router = express.Router();

router.post("/addGuardian",upload.none(), addGuardian);
router.get("/getAllGuardiansByAdmin", verifyAccessToken, getAllGuardiansByAdmin);

export default router;
