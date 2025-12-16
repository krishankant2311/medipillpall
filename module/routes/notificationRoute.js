import express from "express";
import {
  getCaretakerNotifications,sendNotificationToAllPatient,
  getGuardianNotifications,sendNotificationToCaretaker,seenNotificationForCaretaker,
sendNotificationtoguardian,sendNotificationToAllCaretaker,registerPlayerIdPatient,
registerPlayerIdCaretaker,registerPlayerIdGuardian,sendNotificationTospecificGuardian,
sendNotificationToAllApps,getAdminNotifications,getOneSignalcaretaker,getOneSignalguardian,sendNotificationToPatient,
} from "../controllers/notificationController.js";

import { verifyAccessToken } from "../../helpers/jwt.js";
// import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js";

const router = express.Router();

// 🔥 Caretaker → Get his own notifications
router.get("/caretaker/get", verifyAccessToken, getCaretakerNotifications);

// 🔥 Guardian → Get his own notifications
router.get("/guardian/get", verifyAccessToken, getGuardianNotifications);


router.post("/send-to-guardian",verifyAccessToken,upload.none(),sendNotificationtoguardian);
router.post("/send-to-all-patients",verifyAccessToken,upload.none(),sendNotificationToAllPatient);
router.post("/send-to-caretaker",verifyAccessToken,upload.none(),sendNotificationToAllCaretaker);

router.post("/send-to-specific-caretaker",verifyAccessToken,upload.none(),sendNotificationToCaretaker)
router.post("/send-to-specific-guardian",verifyAccessToken,upload.none(),sendNotificationTospecificGuardian)
router.post("/send-to-specific-patient",verifyAccessToken,upload.none(),sendNotificationToPatient)
router.post("/send-to-all-apps",verifyAccessToken,upload.none(),sendNotificationToAllApps);

router.get("/admin/get", verifyAccessToken, getAdminNotifications);

router.get("/onesignal-users", verifyAccessToken, getOneSignalcaretaker);

router.get("/onesignal-guardians", verifyAccessToken, getOneSignalguardian);


router.post("/registerPlayer-patient",verifyAccessToken,upload.none(),registerPlayerIdPatient)
router.post("/registerPlayer-caregiver",verifyAccessToken,upload.none(),registerPlayerIdCaretaker)
router.post("/registerPlayer-guardian",verifyAccessToken,upload.none(),registerPlayerIdGuardian)


router.post("/seen-by-caretaker",verifyAccessToken,upload.none(),seenNotificationForCaretaker)
export default router;
