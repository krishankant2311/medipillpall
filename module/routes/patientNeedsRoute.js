import express from "express";
import { addNeedsByPatient, editNeedsByPatient,getNeedsDetailsByPatient,getAllNeedsByPatient, } from "../controllers/patientNeedsController.js";
import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js";

const router = express.Router();

//  Add Needs (Caretaker Only)
router.post("/add-needs",verifyAccessToken,upload.none(),addNeedsByPatient);

//  Edit Needs (Patient Only)
router.post("/edit-needs/:needsId",verifyAccessToken,editNeedsByPatient);

//  Get All Needs (Patient Only)
router.get("/all-needs", verifyAccessToken, getAllNeedsByPatient);
router.get("/getNeedsDetailsByPatient/:id", verifyAccessToken, getNeedsDetailsByPatient);

export default router;
