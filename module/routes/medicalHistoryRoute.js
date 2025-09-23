import express from "express"
import { addMedicalHistory,getMedicalHistoryByPatient,editMedicalHistory } from "../controllers/medicalHistoryController.js"
import upload from "../../config/multer.js"
import { verifyAccessToken , verifyRefreshToken } from "../../helpers/jwt.js"
const router = express.Router()

router.post("/add-medical-history", upload.none(),verifyAccessToken,addMedicalHistory)
router.post("/edit-medical-history/:historyId",upload.none(),verifyAccessToken,editMedicalHistory)
router.get("/get-medical-history/:patientId",verifyAccessToken,getMedicalHistoryByPatient);


export default router;