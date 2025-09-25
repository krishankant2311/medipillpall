import express from "express";
import {
  addPersonalContact,
  editPersonalContact,
  getPersonalContacts,
  deletePersonalContact,
} from "../controllers/personalContactController.js";

const router = express.Router();

// Add new personal contact
router.post("/add", addPersonalContact);

// Edit personal contact
router.put("/edit/:contactId", editPersonalContact);

// Get all personal contacts (with pagination)
router.get("/list", getPersonalContacts);

// Delete personal contact (soft delete)
router.delete("/delete/:contactId", deletePersonalContact);

export default router;
