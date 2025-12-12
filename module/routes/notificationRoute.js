import express from "express";
import {
  sendNotificationToUser,
  getPatientNotifications,
  getCaretakerNotifications,
  getGuardianNotifications,sendToAllPatients,
sendToAllGuardians,sendToAllCaretakers,sendNotificationToCaretaker,
sendNotificationtoguardian,sendNotificationToAllCaretaker,registerPlayerIdPatient,
registerPlayerIdCaretaker,registerPlayerIdGuardian,sendNotificationTospecificGuardian,
sendNotificationToAllApps,getAdminNotifications,getOneSignalcaretaker,getOneSignalguardian,
} from "../controllers/notificationController.js";

import { verifyAccessToken } from "../../helpers/jwt.js";
// import { verifyAccessToken } from "../../helpers/jwt.js";
import upload from "../../config/multer.js";

const router = express.Router();

// 🔥 Admin → Send Notification (DB me save hoti hai)
router.post("/send", sendNotificationToUser);

// 🔥 Patient → Get his own notifications
router.get("/patient/get", verifyAccessToken, getPatientNotifications);

// 🔥 Caretaker → Get his own notifications
router.get("/caretaker/get", verifyAccessToken, getCaretakerNotifications);

// 🔥 Guardian → Get his own notifications
router.get("/guardian/get", verifyAccessToken, getGuardianNotifications);

// 🔥 Admin → Send Notification to all Patients
router.post("/send-to-all-patients", sendToAllPatients);
// 🔥 Admin → Send Notification to all Caretakers
router.post("/send-to-all-caretakers", sendToAllCaretakers);
// 🔥 Admin → Send Notification to all Guardians
router.post("/send-to-all-guardians", sendToAllGuardians);

router.post("/send-to-guardian",verifyAccessToken,upload.none(),sendNotificationtoguardian);

router.post("/send-to-caretaker",verifyAccessToken,upload.none(),sendNotificationToAllCaretaker);

router.post("/send-to-specific-caretaker",verifyAccessToken,upload.none(),sendNotificationToCaretaker)
router.post("/send-to-specific-guardian",verifyAccessToken,upload.none(),sendNotificationTospecificGuardian)

router.post("/send-to-all-apps",verifyAccessToken,upload.none(),sendNotificationToAllApps);

router.get("/admin/get", verifyAccessToken, getAdminNotifications);

router.get("/onesignal-users", verifyAccessToken, getOneSignalcaretaker);

router.get("/onesignal-guardians", verifyAccessToken, getOneSignalguardian);



router.post("/registerPlayer-caregiver",verifyAccessToken,upload.none(),registerPlayerIdCaretaker)
router.post("/registerPlayer-guardian",verifyAccessToken,upload.none(),registerPlayerIdGuardian)
export default router;
