import express from "express";
import {
  getCaretakerNotifications,sendNotificationToAllPatient,seenNotificationForGuardian,
  getGuardianNotifications,sendNotificationToCaretaker,seenNotificationForCaretaker,
sendNotificationtoguardian,sendNotificationToAllCaretaker,registerPlayerIdPatient,
registerPlayerIdCaretaker,registerPlayerIdGuardian,sendNotificationTospecificGuardian,seenNotificationForPatient,
sendNotificationToAllApps,getAdminNotifications,getOneSignalcaretaker,getOneSignalguardian,sendNotificationToPatient,
deleteNotificationCaregiver,deleteNotificationGuardian,
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
router.post("/seen-by-guardian",verifyAccessToken,upload.none(),seenNotificationForGuardian)
router.post("/seen-by-patient",verifyAccessToken,upload.none(),seenNotificationForPatient)


router.post("/delete-by-caregiver",verifyAccessToken,upload.none(),deleteNotificationCaregiver)
router.post("/delete-by-guardian",verifyAccessToken,upload.none(),deleteNotificationGuardian)
export default router;
