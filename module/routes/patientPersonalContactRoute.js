import express from "express";
import {
  addPersonalContact,
  editPersonalContact,
  getPersonalContacts,
  deletePersonalContact,
} from "../controllers/patientPersonalContactController.js";
import upload from "../../config/multer.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
const router = express.Router();

// Add new personal contact
router.post("/add",verifyAccessToken,upload.none(), addPersonalContact);

// Edit personal contact
router.post("/edit/:contactId",verifyAccessToken,upload.none(), editPersonalContact);

// Get all personal contacts (with pagination)
router.get("/list",verifyAccessToken, getPersonalContacts);

// Delete personal contact (soft delete)
router.post("/delete/:contactId",verifyAccessToken, upload.none, deletePersonalContact);

export default router;
