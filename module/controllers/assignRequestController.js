import AssignRequest from "../models/assignRequestModel.js";    
import Guardian from "../models/guardiansModel/guardianModel.js";
import Patient from "../models/patientModel.js";
import Caregiver from "../models/caretakerModel/caretakerModel.js";

export const sendAssignRequest = async (req, res) => {
  try {
    const token = req.token; // guardian
    const { patient_id, caregiver_id } = req.body;

    // validate guardian
    const guardian = await Guardian.findOne({ _id: token._id, status: "Active" });
    if (!guardian) {
      return res.status(404).json({ success: false, message: "Guardian not found or inactive" });
    }

    // validate patient
    const patient = await Patient.findOne({ _id: patient_id, status: "Active" });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // validate caregiver
    const caregiver = await Caregiver.findOne({ _id: caregiver_id, status: "Active" });
    if (!caregiver) {
      return res.status(404).json({ success: false, message: "Caregiver not found" });
    }

    // check if any existing pending request for same target
    const already = await AssignRequest.findOne({
      guardianId: guardian._id,
      caregiverId: caregiver_id,
      patientId: patient_id,
      status: "Pending",
    });

    if (already) {
      return res.status(400).json({
        success: false,
        message: "Request already sent and is pending",
      });
    }

    // create new request
    const request = await AssignRequest.create({
      guardianId: guardian._id,
      caregiverId: caregiver_id,
      patientId: patient_id,
    });

    return res.status(200).json({
      success: true,
      message: "Assign request sent successfully",
      result: request,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignRequestsForCaregiver = async (req, res) => {
  try {
    const token = req.token;

    const caregiver = await Caregiver.findOne({ _id: token._id, status: "Active" });
    if (!caregiver) {
      return res.status(404).json({ success: false, message: "Caregiver not found" });
    }

    const requests = await AssignRequest.find({
      caregiverId: token._id,
      status: "Pending"
    })
      .populate("guardianId", "fullName")
      .populate("patientId", "fullName age gender");

    return res.status(200).json({
      success: true,
      message: "Assign requests fetched",
      result: requests,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const handleAssignRequest = async (req, res) => {
  try {
    const token = req.token; // caregiver
    const { request_id, action } = req.body; // action = "Accepted" / "Rejected"

    const request = await AssignRequest.findOne({ _id: request_id });
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.caregiverId.toString() !== token._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Update Status
    request.status = action;
    await request.save();

    if (action === "Rejected") {
      return res.status(200).json({ success: true, message: "Request rejected" });
    }

    // ============================
    // If ACCEPTED → Now Assign
    // ============================

    const patient = await Patient.findById(request.patientId);
    const guardian = await Guardian.findById(request.guardianId);
    const caregiver = await Caregiver.findById(request.caregiverId);

    patient.guardianId = guardian._id;
    patient.caretakerId = caregiver._id;
    await patient.save();

    if (!guardian.patients.includes(patient._id)) {
      guardian.patients.push(patient._id);
    }
    if (!guardian.caretakers.includes(caregiver._id)) {
      guardian.caretakers.push(caregiver._id);
    }
    await guardian.save();

    if (!caregiver.patients.includes(patient._id)) {
      caregiver.patients.push(patient._id);
    }
    caregiver.guardianId = guardian._id;
    await caregiver.save();

    return res.status(200).json({
      success: true,
      message: "Request accepted & patient assigned successfully",
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
