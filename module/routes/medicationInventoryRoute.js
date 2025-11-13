import express from "express";
import { addMedicationInventory, getAllMedicationInventory,addMedicationByCaretaker, softDeleteMedication } from "../controllers/medicationInventoryController.js";
import { verifyAccessToken , verifyRefreshToken } from "../../helpers/jwt.js"
import upload from "../../config/multer.js"
const router = express.Router();

router.post("/add", verifyAccessToken, addMedicationInventory);
router.get("/getAll", verifyAccessToken, getAllMedicationInventory);
router.post("/softDelete/:medicationId", verifyAccessToken,upload.none(),softDeleteMedication);
router.post("/addByCaretaker/:patientId", verifyAccessToken,upload.none(), addMedicationByCaretaker);

export default router;
