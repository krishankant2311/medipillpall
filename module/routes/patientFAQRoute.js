// routes/faqRoutes.js

import express from "express";
import { verifyAccessToken } from "../../helpers/jwt.js";
import { createFAQ, editFAQ, getFAQ, deleteFAQ, getAllFAQ, getAllFAQByPatient } from "../controllers/patientFAQController.js";
import upload from "../../config/multer.js";
const router = express.Router();

// ================= ADMIN ROUTES =================
router.post("/create", verifyAccessToken,upload.none(), createFAQ);
router.post("/edit/:faqId", verifyAccessToken,upload.none(), editFAQ);
router.get("/get/:id", verifyAccessToken, getFAQ);
router.post("/delete/:faqId", verifyAccessToken,upload.none(), deleteFAQ);
router.get("/all", verifyAccessToken,upload.none(), getAllFAQ);
router.get("/all/patient", verifyAccessToken, getAllFAQByPatient);

export default router;
