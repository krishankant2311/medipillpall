// routes/visitorRoutes.js
import express from "express";
import {
  addVisitor,
  getVisitors,
  getAllVisitors,
  editVisitor,
  deleteVisitor,
  getAllVisitorsByAdmin,
} from "../controllers/patientVisitorController.js";
import { verifyAccessToken } from "../../helpers/jwt.js"; // ✅ token middleware
import upload from "../../config/multer.js";
const router = express.Router();

// Add Visitor
router.post("/add", verifyAccessToken,upload.none(), addVisitor);

// Get All Visitors (by logged-in patient)
router.get("/list", verifyAccessToken, getAllVisitors);

// Get Visitor by ID
router.get("/get/:id", verifyAccessToken, getVisitors);

// Update Visitor
router.post("/update/:id", verifyAccessToken,upload.none(), editVisitor);

// Delete Visitor (soft delete)
router.post("/delete/:id", verifyAccessToken,upload.none(), deleteVisitor);
// Get All Visitors (by admin, with pagination)
router.get("/all-visitorByAdmin", verifyAccessToken, getAllVisitorsByAdmin);

export default router;
