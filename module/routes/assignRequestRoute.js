import express from "express";
import {
  sendAssignRequest,
  getAssignRequestsForCaregiver,
  handleAssignRequest,
} from "../controllers/assignRequestController.js";

import {verifyAccessToken} from "../../helpers/jwt.js";


const router = express.Router();

// ------------------ Guardian Routes ------------------

// Guardian → send assign request to caregiver
router.post("/guardian/send-assign-request",verifyAccessToken,sendAssignRequest);

// Caregiver → get all pending assign requests
router.get("/caregiver/assign-requests",verifyAccessToken,getAssignRequestsForCaregiver);

// Caregiver → accept or reject request
router.post("/caregiver/assign-request-action",verifyAccessToken,handleAssignRequest);

export default router;
