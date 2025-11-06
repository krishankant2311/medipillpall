import express from "express";
import {
  uploadVideo,
  createTutorial,
  editTutorial,
  getTutorialByAdmin,
  getTutorialByPatient,
  getAllTutorialsByAdmin,
  getAllTutorialsByPatient,
  deleteTutorial,
  getSingleTutorialByCaretaker,
  getAllTutorialsByCaretaker,
  getAllTutorialsByGuardian,
  getTutorialByGuardian,
} from "../controllers/patientTutorialController.js";
import upload from "../../config/multer.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
// import { verifyPatientToken } from "../middleware/patientAuth.js";

const router = express.Router();


// ================= ADMIN ROUTES =================

// 👉 Create Tutorial (Admin)
router.post("/admin/create", verifyAccessToken, upload.single("videoFile"), createTutorial);

// 👉 Edit Tutorial (Admin)
router.post("/admin/edit/:id", verifyAccessToken, upload.single("videoFile"), editTutorial);

// 👉 Get One Tutorial by ID (Admin)
router.get("/admin/:id", verifyAccessToken, getTutorialByAdmin);

// 👉 Get All Tutorials (Admin)
router.get("/admin", verifyAccessToken, getAllTutorialsByAdmin);

// 👉 Delete Tutorial (Admin)
router.post("/admin/delete/:id", verifyAccessToken, deleteTutorial);



// ================= PATIENT ROUTES =================

// 👉 Get One Tutorial by ID (Patient)
router.get("/patient/:id", verifyAccessToken, getTutorialByPatient);

// 👉 Get All Tutorials (Patient)
router.get("/patient", verifyAccessToken, getAllTutorialsByPatient);

router.get("/getby-caretaker", verifyAccessToken, getAllTutorialsByCaretaker);

router.get("/getby-caretaker/:tutorialId", verifyAccessToken, getSingleTutorialByCaretaker);

router.get("/getby-guardian", verifyAccessToken, getAllTutorialsByGuardian);
router.get("/getby-guardian/:id", verifyAccessToken, getTutorialByGuardian);
export default router;
