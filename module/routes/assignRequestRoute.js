import express from "express";
import {
  sendAssignRequest,
  getAssignRequestsForCaregiver,
  handleAssignRequest,
} from "../controllers/assignRequestController.js";

import {verifyAccessToken} from "../../helpers/jwt.js";
import upload from "../../config/multer.js";

const router = express.Router();

// ------------------ Guardian Routes ------------------

// Guardian → send assign request to caregiver
router.post("/guardian/send-assign-request",verifyAccessToken,upload.none(),sendAssignRequest);

// Caregiver → get all pending assign requests
router.get("/caregiver/assign-requests",verifyAccessToken,upload.none(),getAssignRequestsForCaregiver);

// Caregiver → accept or reject request
router.post("/caregiver/assign-request-action",verifyAccessToken,upload.none(),handleAssignRequest);

export default router;
