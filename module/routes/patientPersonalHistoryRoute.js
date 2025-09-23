import express from "express";
import {
  addPersonalHistory,
  editPersonalHistory,
  getPersonalHistory,
  deletePersonalHistory,
} from "../controllers/personalHistoryController.js";
import { verifyAccessToken } from "../../helpers/jwt.js";

const router = express.Router();

router.post("/add-personal-history", verifyAccessToken, addPersonalHistory);

router.put("/edit-history/:historyId", verifyAccessToken, editPersonalHistory);

router.get("/get-personal-history", verifyAccessToken, getPersonalHistory);


router.delete("/delete-history/:historyId", verifyAccessToken, deletePersonalHistory);

export default router;