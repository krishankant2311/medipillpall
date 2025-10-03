import express from "express";
import {
  addPersonalHistory,
  editPersonalHistory,
  getPersonalHistory,
  deletePersonalHistory,
} from "../controllers/patientPersonalHistoryController.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js";
const router = express.Router();

router.post("/add-personal-history",upload.none(), verifyAccessToken, addPersonalHistory);

router.post("/edit-history/:historyId", verifyAccessToken,upload.none(), editPersonalHistory);

router.get("/get-personal-history", verifyAccessToken, getPersonalHistory);


router.post("/delete-history/:historyId", verifyAccessToken,upload.none(), deletePersonalHistory);

export default router;