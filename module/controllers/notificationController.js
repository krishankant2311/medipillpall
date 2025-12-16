import Notification from "../models/notificationModel.js";
import Admin from "../models/adminModel.js";
// import Notification from "../models/Notification.js";
import Caretaker from "../../module/models/caretakerModel/caretakerModel.js"
import Guardian from "../../module/models/guardiansModel/guardianModel.js"
import Patient from "../models/patientModel.js";
import dotenv from "dotenv";
dotenv.config();



export const getCaretakerNotifications = async (req, res) => {
  try {
    const token = req.token; // Caregiver token

    if (!token || !token._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const notifications = await Notification.find({
      caretakerId: token._id,
      userType: "Caregiver",
      status: { $ne: "Deleted" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Caregiver notifications fetched successfully",
      result: notifications,
    });

  } catch (error) {
    console.log("Error fetching caregiver notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getGuardianNotifications = async (req, res) => {
  try {
    const token = req.token; // Guardian token

    if (!token || !token._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const notifications = await Notification.find({
      guardianId: token._id,
      userType: "Guardian",
      status: { $ne: "Deleted" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Guardian notifications fetched successfully",
      result: notifications,
    });

  } catch (error) {
    console.log("Error fetching guardian notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getPatientNotifications = async (req, res) => {
  try {
    const token = req.token; // Patient token
    if (!token || !token._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    const notifications = await Notification.find({ 
      patientId: token._id,
      userType: "Patient",
      status: { $ne: "Deleted" },
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Patient notifications fetched successfully",
      result: notifications,
    });
  } catch (error) {
    console.log("Error fetching patient notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const registerPlayerIdPatient = async (req, res) => {
  try {
    const { playerId } = req.body;
    const token = req.token;

    if (!playerId) {
      return res.status(403).send({
        statusCode: 403,
        success: false,
        message: "player id is required",
        result: {},
      });
    }

    const patient = await Patient.findOne({ _id: token._id });
    if (!patient) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    patient.playerId = playerId;
    await patient.save();

    return res.status(200).send({
      statusCode: 200,
      success: true,
      message: "Player ID saved successfully",
      result: {},
    });

  } catch (error) {
    console.error("Register PlayerId Patient Error:", error.message);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Error in register player id API",
      result: {},
    });
  }
};
export const registerPlayerIdCaretaker = async (req, res) => {
  try {
    const { playerId } = req.body;
    const token = req.token;

    if (!playerId) {
      return res.status(403).send({
        statusCode: 403,
        success: false,
        message: "player id is required",
        result: {},
      });
    }

    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!caretaker) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: "Caregiver not found",
        result: {},
      });
    }

    caretaker.playerId = playerId;
    await caretaker.save();

    return res.status(200).send({
      statusCode: 200,
      success: true,
      message: "Player ID saved successfully",
      result: {},
    });
  } catch (error) {
    console.error("Register PlayerId Caregiver Error:", error); // ✅ FIXED
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Error in register player id API",
      result: {},
    });
  }
};
export const registerPlayerIdGuardian = async (req, res) => {
  try {
    const { playerId } = req.body;
    const token = req.token;

    if (!playerId) {
      return res.status(403).send({
        statusCode: 403,
        success: false,
        message: "player id is required",
        result: {},
      });
    }

    const guardian = await Guardian.findOne({ _id: token._id });
    if (!guardian) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: "Guardian not found",
        result: {},
      });
    }

    guardian.playerId = playerId;
    await guardian.save();

    return res.status(200).send({
      statusCode: 200,
      success: true,
      message: "Player ID saved successfully",
      result: {},
    });

  } catch (error) {
    console.error("Register PlayerId Guardian Error:", error.message);
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: "Error in register player id API",
      result: {},
    });
  }
};
const isValidUUID = (id) =>
  typeof id === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);


export const sendNotificationToPatient = async (req, res) => {
  try {
    const { patientId, title, message } = req.body;
    const token = req.token;

    // 🔹 Required fields validation
    if (!patientId || !title || !message) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "patientId, title & message are required",
        result: {},
      });
    }

    // 🔹 Validate admin
    const admin = await Admin.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!admin) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    // 🔹 Fetch patient
    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active",
    });
    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    // 🔹 Validate playerId
    if (!patient.playerId || !isValidUUID(patient.playerId.trim())) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Patient does not have a valid playerId",
        result: {},
      });
    }

    // 🔹 Image upload (optional)
    let imageUrl = null;
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    // -------------------------------
    // 🔔 OneSignal Payload
    // -------------------------------
    const payload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [patient.playerId.trim()],
      headings: { en: title },
      contents: { en: message },
    };

    if (imageUrl) {
      payload.big_picture = imageUrl;
      payload.ios_attachments = { id1: imageUrl };
    }

    // -------------------------------
    // 🔔 Send Notification
    // -------------------------------
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      payload,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        },
      }
    );

    // -------------------------------
    // 💾 Save Notification in DB (🔥 IMPORTANT FIX)
    // -------------------------------
    await Notification.create({
      sentByAdmin: token._id,
      patientId: patient._id,
      title,
      message,
      imageUrl,
      status: "Sent",
      userType: "Patient",   // 🔥 REQUIRED
      sentToAll: false,      // 🔥 REQUIRED
      type: "General",
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to patient successfully",
      result: response.data,
    });

  } catch (err) {
    console.error("sendNotificationToPatient error:", err);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error sending notification",
      result: err.response?.data || err.message,
    });
  }
};


export const sendNotificationToCaretaker = async (req, res) => {
  try {
    const { caretakerId, title, message } = req.body;
    const token = req.token;

    // 🔹 Required fields validation
    if (!caretakerId || !title || !message) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "caretakerId, title & message are required",
        result: {},
      });
    }

    // 🔹 Validate admin
    const admin = await Admin.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!admin) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    // 🔹 Fetch caretaker
    const caretaker = await Caretaker.findOne({
      _id: caretakerId,
      status: "Active",
    });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caregiver not found",
        result: {},
      });
    }

    // 🔹 Validate playerId
    if (!caretaker.playerId || !isValidUUID(caretaker.playerId.trim())) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Caregiver does not have a valid playerId",
        result: {},
      });
    }

    // 🔹 Image upload (optional)
    let imageUrl = null;
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    // -------------------------------
    // 🔔 OneSignal Payload
    // -------------------------------
    const payload = {
      app_id: process.env.ONESIGNAL_CARETAKER_APP_ID,
      include_player_ids: [caretaker.playerId.trim()],
      headings: { en: title },
      contents: { en: message },
    };

    if (imageUrl) {
      payload.big_picture = imageUrl;
      payload.ios_attachments = { id1: imageUrl };
    }

    // -------------------------------
    // 🔔 Send Notification
    // -------------------------------
    const response = await axios.post(
      process.env.ONESIGNAL_API,
      payload,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_CARETAKER_REST_KEY}`,
        },
      }
    );

    // -------------------------------
    // 💾 Save Notification in DB (🔥 IMPORTANT FIX)
    // -------------------------------
    await Notification.create({
      sentByAdmin: token._id,
      caretakerId: caretaker._id,
      title,
      message,
      imageUrl,
      status: "Sent",
      userType: "Caregiver",   // 🔥 REQUIRED
      sentToAll: false,        // 🔥 REQUIRED
      type: "General",
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to caregiver successfully",
      result: response.data,
    });

  } catch (err) {
    console.error("sendNotificationToCaretaker error:", err);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error sending notification",
      result: err.response?.data || err.message,
    });
  }
};

import axios from "axios";
import status from "statuses";

const ONE_SIGNAL_API = process.env.ONESIGNAL_API;
const REST_KEY = process.env.ONESIGNAL_REST_KEY;
const APP_ID = process.env.ONESIGNAL_APP_ID;


// export const sendNotificationtoguardian = async (req, res) => {
//   try {
//     const { title, message, imageUrl } = req.body;

//     let token = req.token;

// //  console.log("Token in sendNotificationtoguardian:", req.token   );
//     // ✅ FIX: Prevent crash if token missing
//     if (!token || !token._id) {
//       return res.status(401).json({
//         ok: false,
//         error: "Invalid or missing token",
//       });
//     }

//     // ✅ Validate admin
//     const admin = await Admin.findOne({ _id: token._id, status: "Active" });
//     if (!admin) {
//       return res.status(403).json({
//         ok: false,
//         error: "Unauthorized or deleted admin",
//       });
//     }
// //  console.log("Admin validated:", admin._id);  
//     // 🔥 OneSignal Payload
//     const payload = {
//       app_id: APP_ID,
//       included_segments: ["All"],
//       headings: { en: title || "Default title" },
//       contents: { en: message || "Default message" },
//       big_picture: imageUrl || undefined,
//       ios_attachments: imageUrl ? { id: imageUrl } : undefined
//     };
// // console.log("Payload prepared:", payload);/
//     // 🔥 Send Notification
//     const resp = await axios.post(ONE_SIGNAL_API, payload, {
//       headers: {
//         "Content-Type": "application/json;charset=utf-8",
//         Authorization: `Basic ${REST_KEY}`,
//       },
//     });
//     // console.log("OneSignal Response:", resp.data);

//     return res.json({
//       success: true,
//       message: "Notification sent to Guardian users",
//       statusCode: 200,
//       result: resp.data,
//     });

//   } catch (err) {
//     return res.status(500).json({
//       ok: false,
//       error: err?.response?.data || err.message,
//     });
//   }
// };


export const sendNotificationtoguardian = async (req, res) => {
  try {
    const { title, message, imageUrl } = req.body;

    let token = req.token;

    if (!token || !token._id) {
      return res.status(401).json({
        ok: false,
        error: "Invalid or missing token",
      });
    }

    const admin = await Admin.findOne({ _id: token._id, status: "Active" });
    if (!admin) {
      return res.status(403).json({
        ok: false,
        error: "Unauthorized or deleted admin",
      });
    }

    // 🔥 OneSignal Payload
    const payload = {
      app_id: APP_ID,
      included_segments: ["All"],
      headings: { en: title },
      contents: { en: message },
      big_picture: imageUrl || undefined,
      ios_attachments: imageUrl ? { id: imageUrl } : undefined
    };

    // 🔥 Send Notification via OneSignal
    const resp = await axios.post(ONE_SIGNAL_API, payload, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${REST_KEY}`,
      },
    });

    // -------------------------------------------
    // 🟢 SAVE NOTIFICATION INTO DATABASE
    // (❗ NOTHING REMOVED — ONLY ADDED)
    // -------------------------------------------
    await Notification.create({
      title,
      message,
      imageUrl,

      sentTo: "Guardian",
      createdBy: admin._id,
      userType: "Guardian",
      status: "Sent",

      // ✅ ADDED (as discussed)
      sentToAll: true,          // 🔥 ALL guardians
      type: "General",          // 🔥 standard
      onesignalResponse: resp.data, // 🔥 optional but useful
    });

    return res.json({
      success: true,
      message: "Notification sent to Guardian users",
      statusCode: 200,
      result: resp.data,
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.response?.data || err.message,
    });
  }
};



const APP_ID_PATIENT = process.env.ONESIGNAL_PATIENT_APP_ID

const REST_KEY_PATIENT = process.env.ONESIGNAL_PATIENT_REST_KEY
export const sendNotificationToAllPatient = async (req, res) => {
  try {
    const { title, message } = req.body;
    const token = req.token;

    // 🔹 Validate admin
    const admin = await Admin.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!admin) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    // 🔹 Validate required fields
    if (!title || !message) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "title and message are required",
        result: {},
      });
    }

    // 🔹 Image upload (optional)
    let imageUrl = null;
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    // -------------------------------
    // 🔔 OneSignal Payload
    // -------------------------------
    const payload = {
      app_id: process.env.ONESIGNAL_PATIENT_APP_ID,
      included_segments: ["All"], // 🔥 ALL Patients
      headings: { en: title },
      contents: { en: message },
    };

    if (imageUrl) {
      payload.big_picture = imageUrl;
      payload.ios_attachments = { id1: imageUrl };
    }

    // -------------------------------
    // 🔔 Send Notification
    // -------------------------------
    const response = await axios.post(
      process.env.ONESIGNAL_API,
      payload,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_PATIENT_REST_KEY}`,
        },
      }
    );

    // -------------------------------
    // 💾 Save Notification in DB (🔥 STANDARD FORMAT)
    // -------------------------------
    await Notification.create({
      sentByAdmin: token._id,
      title,
      message,
      imageUrl,
      status: "Sent",
      userType: "Patient",   // 🔥 SAME STANDARD
      sentToAll: true,       // 🔥 ALL patients
      type: "General",
      onesignalResponse: response.data,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to all patients successfully",
      result: response.data,
    });

  } catch (error) {
    console.error(
      "sendNotificationToAllPatient error:",
      error?.response?.data || error.message
    );

    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Failed to send notification",
      result: error?.response?.data || error.message,
    });
  }
};



const APP_ID_CARETAKER = process.env.ONESIGNAL_CARETAKER_APP_ID;
const REST_KEY_CARETAKER = process.env.ONESIGNAL_CARETAKER_REST_KEY;


export const sendNotificationToAllCaretaker = async (req, res) => {
  try {
    const { title, message } = req.body;
    const token = req.token;

    // 🔹 Validate admin
    const admin = await Admin.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!admin) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    // 🔹 Image upload (optional)
    let imageUrl = null;
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    // -------------------------------
    // 🔔 OneSignal Payload
    // -------------------------------
    const payload = {
      app_id: process.env.ONESIGNAL_CARETAKER_APP_ID,
      included_segments: ["All"], // 🔥 ALL Caretakers
      headings: { en: title || "Default title" },
      contents: { en: message || "Default message" },
    };

    if (imageUrl) {
      payload.big_picture = imageUrl;
      payload.ios_attachments = { id1: imageUrl };
    }

    // -------------------------------
    // 🔔 Send Notification
    // -------------------------------
    const response = await axios.post(
      process.env.ONESIGNAL_API,
      payload,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_CARETAKER_REST_KEY}`,
        },
      }
    );

    // -------------------------------
    // 💾 Save Notification in DB (🔥 STANDARD FORMAT)
    // -------------------------------
    await Notification.create({
      sentByAdmin: token._id,
      title: title || "Default title",
      message: message || "Default message",
      imageUrl,
      status: "Sent",
      userType: "Caregiver",   // 🔥 SAME STANDARD
      sentToAll: true,         // 🔥 ALL caregivers
      type: "General",
      onesignalResponse: response.data,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to all caregivers successfully",
      result: response.data,
    });

  } catch (err) {
    console.error("sendNotificationToAllCaretaker error:", err);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error sending notification",
      result: err?.response?.data || err.message,
    });
  }
};


export const sendNotificationToAllApps = async (req, res) => {
  try {
    const { title, message, imageUrl } = req.body;
    const token = req.token;

    // 🔐 Admin validation
    const admin = await Admin.findOne({ _id: token._id, status: "Active" });
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized admin",
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "title and message are required",
      });
    }

    // 🔔 Base OneSignal Payload
    const basePayload = {
      included_segments: ["All"],
      headings: { en: title },
      contents: { en: message },
      big_picture: imageUrl || undefined,
      ios_attachments: imageUrl ? { id: imageUrl } : undefined,
    };

    // 📱 All Apps Config
    const apps = [
      {
        userType: "Guardian",
        appId: process.env.ONESIGNAL_APP_ID,
        restKey: process.env.ONESIGNAL_REST_KEY,
      },
      {
        userType: "Patient",
        appId: process.env.ONESIGNAL_PATIENT_APP_ID,
        restKey: process.env.ONESIGNAL_PATIENT_REST_KEY,
      },
      {
        userType: "Caregiver",
        appId: process.env.ONESIGNAL_CARETAKER_APP_ID,
        restKey: process.env.ONESIGNAL_CARETAKER_REST_KEY,
      },
    ];

    let responses = [];

    // 🚀 Send Notification to each app
    for (const app of apps) {
      try {
        if (!app.appId || !app.restKey) {
          throw new Error("Missing OneSignal credentials");
        }

        const payload = {
          ...basePayload,
          app_id: app.appId,
        };

        const resp = await axios.post(
          process.env.ONESIGNAL_API,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${app.restKey}`,
            },
          }
        );

        responses.push({
          userType: app.userType,
          status: "sent",
          onesignalId: resp.data.id || null,
          response: resp.data,
        });

      } catch (error) {
        responses.push({
          userType: app.userType,
          status: "failed",
          error: error?.response?.data || error.message,
        });
      }
    }

    // 🧠 Final Notification Status
    let finalStatus = "Failed";
    const sentCount = responses.filter(r => r.status === "sent").length;

    if (sentCount === responses.length) {
      finalStatus = "Sent";
    } else if (sentCount > 0) {
      finalStatus = "Partial";
    }

    // 💾 Save Notification in DB
    await Notification.create({
      title,
      message,
      imageUrl: imageUrl || null,
      userType: "All",
      type: "General",
      sentToAll: true,
      status: finalStatus,          // ✅ FIXED
      onesignalResponse: responses,
    });

    return res.status(200).json({
      success: true,
      message: "Notification processed",
      status: finalStatus,
      responses,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: err.message,
    });
  }
};



// export const getAdminNotifications = async (req, res) => {
//   try {
//     const token = req.token;
//     const admin = await Admin.findOne({ _id: req.token._id, status: "Active" });
//     if (!admin) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized admin",
//       });
//     }

//     // Pagination
//     let { page = 1, limit = 10 } = req.query;
//     page = parseInt(page);
//     limit = parseInt(limit);

//     const notifications = await Notification.find()
//       .sort({ createdAt: -1 }) // latest first
//       .skip((page - 1) * limit)
//       .limit(limit);

//     const total = await Notification.countDocuments();

//     return res.json({
//       success: true,
//       page,
//       limit,
//       total,
//       notifications,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

export const getAdminNotifications = async (req, res) => {
  try {
    const token = req.token;

    // ✅ Admin check
    const admin = await Admin.findOne({ _id: token._id, status: "Active" });
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized admin",
      });
    }

    // 🔢 Pagination + search
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // 🔍 Filter
    const filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } },
        { userType: { $regex: search.trim(), $options: "i" } }, // ✅ userType search
      ];
    }

    // 📦 Fetch data
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments(filter);

    return res.json({
      success: true,
      page,
      limit,
      total,
      notifications,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


export const getOneSignalcaretaker = async (req, res) => {
  try {
    const response = await axios.get(
      `https://onesignal.com/api/v1/players?app_id=${APP_ID_CARETAKER}`,
      {
        headers: {
          Authorization: `Basic ${REST_KEY_CARETAKER}`,
        },
      }
    );
    res.json(response.data.players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOneSignalguardian = async (req, res) => {
  try {
    const response = await axios.get(
      `https://onesignal.com/api/v1/players?app_id=${APP_ID}`,
      {
        headers: {
          Authorization: `Basic ${REST_KEY}`,
        },
      }
    );
    res.json(response.data.players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export const sendNotificationTospecificGuardian = async (req, res) => {
//   try {
//     const { guardianId, title, message } = req.body;

//     // Validate required fields
//     if (!guardianId || !title || !message) {
//       return res.status(403).json({
//         statusCode: 403,
//         success: false,
//         message: "guardianId, title & message are required",
//         result: {},
//       });
//     }

//     // Validate admin
//     const admin = await Admin.findOne({ _id: req.token._id, status: "Active" });
//     if (!admin) {
//       return res.status(403).json({
//         statusCode: 403,
//         success: false,
//         message: "Unauthorized or deleted admin",
//         result: {},
//       });
//     }

//     // Fetch guardian
//     const guardian = await Guardian.findOne({ _id: guardianId });
//     if (!guardian) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "Guardian not found",
//         result: {},
//       });
//     }

//     // Validate playerId
//     if (!guardian.playerId || !isValidUUID(guardian.playerId.trim())) {
//       return res.status(403).json({
//         statusCode: 403,
//         success: false,
//         message: "Guardian does not have a valid playerId",
//         result: {},
//       });
//     }

//     let imageUrl = "";
//     if (req.file) {
//       const sanitized = req.file.filename.replace(/\s+/g, "-");
//       imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
//     }

//     // -------------------------------
//     // OneSignal Payload
//     // -------------------------------
//     const payload = {
//       app_id: process.env.ONESIGNAL_APP_ID,   // Guardian App ID
//       include_player_ids: [guardian.playerId.trim()],
//       headings: { en: title },
//       contents: { en: message },
//     };

//     if (imageUrl) {
//       payload.big_picture = imageUrl;
//       payload.ios_attachments = { id1: imageUrl };
//     }

//     // -------------------------------
//     // Send Notification
//     // -------------------------------
//     const response = await axios.post(
//       process.env.ONESIGNAL_API,
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Basic ${process.env.ONESIGNAL_REST_KEY}`, // Guardian REST Key
//         },
//       }
//     );

//     // -------------------------------
//     // Save to DB
//     // -------------------------------
//     await Notification.create({
//       sentByAdmin: req.token._id,
//       guardianId,
//       title,
//       message,
//       image: imageUrl,
//     });

//     return res.status(200).json({
//       statusCode: 200,
//       success: true,
//       message: "Notification sent to guardian successfully",
//       result: response.data,
//     });

//   } catch (err) {
//     return res.status(500).json({
//       statusCode: 500,
//       success: false,
//       message: "Error sending notification",
//       result: err.response?.data || err.message,
//     });
//   }
// };

export const sendNotificationTospecificGuardian = async (req, res) => {
  try {
    const { guardianId, title, message } = req.body;

    // 🔹 Validate required fields
    if (!guardianId || !title || !message) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "guardianId, title & message are required",
        result: {},
      });
    }

    // 🔹 Validate admin
    const admin = await Admin.findOne({
      _id: req.token._id,
      status: "Active",
    });
    if (!admin) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    // 🔹 Fetch guardian
    const guardian = await Guardian.findOne({
      _id: guardianId,
      status: "Active",
    });
    if (!guardian) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Guardian not found",
        result: {},
      });
    }

    // 🔹 Validate playerId
    if (!guardian.playerId || !isValidUUID(guardian.playerId.trim())) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Guardian does not have a valid playerId",
        result: {},
      });
    }

    // 🔹 Image upload (optional)
    let imageUrl = null;
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    // -------------------------------
    // 🔔 OneSignal Payload
    // -------------------------------
    const payload = {
      app_id: process.env.ONESIGNAL_APP_ID, // Guardian App ID
      include_player_ids: [guardian.playerId.trim()],
      headings: { en: title },
      contents: { en: message },
    };

    if (imageUrl) {
      payload.big_picture = imageUrl;
      payload.ios_attachments = { id1: imageUrl };
    }

    // -------------------------------
    // 🔔 Send Notification
    // -------------------------------
    const response = await axios.post(
      process.env.ONESIGNAL_API,
      payload,
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: `Basic ${process.env.ONESIGNAL_REST_KEY}`,
        },
      }
    );

    // -------------------------------
    // 💾 Save Notification in DB (🔥 IMPORTANT FIX)
    // -------------------------------
    await Notification.create({
      sentByAdmin: req.token._id,
      guardianId: guardian._id,
      title,
      message,
      imageUrl,
      status: "Sent",
      userType: "Guardian",   // 🔥 REQUIRED
      sentToAll: false,       // 🔥 REQUIRED
      type: "General",
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to guardian successfully",
      result: response.data,
    });

  } catch (err) {
    console.error("sendNotificationTospecificGuardian error:", err);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error sending notification",
      result: err.response?.data || err.message,
    });
  }
};

export const seenNotificationForCaretaker = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const token = req.token;

    if (!notificationId) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "notificationId is required",
        result: {},
      });
    }
    const caretaker = await Caretaker.findOne({ _id: token._id });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caregiver not found",
        result: {},
      });
    }
    const notification = await Notification.findOne({ _id: notificationId, caretakerId: caretaker._id });
    if (!notification) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Notification not found",
        result: {},
      });
    }
    notification.seen = true;
    await notification.save();
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification marked as seen",
      result: {},
    });
  } catch (error) {
    console.error("Seen Notification Error:", error.message);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error in seen notification API",
      result: {},
    });
  }
};

export const seenNotificationForGuardian = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const token = req.token;

    if (!notificationId) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "notificationId is required",
        result: {},
      });
    }
    const guardian = await Guardian.findOne({ _id: token._id });
    if (!guardian) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Guardian not found",
        result: {},
      });
    }
    const notification = await Notification.findOne({ _id: notificationId, guardianId: guardian._id });
    if (!notification) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Notification not found",
        result: {},
      });
    }
    notification.seen = true;
    await notification.save();
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification marked as seen",
      result: {},
    });
  }
  catch (error) {

    console.error("Seen Notification Error:", error.message);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error in seen notification API",
      result: {},
    });
  }
};

export const seenNotificationForPatient = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const token = req.token;
    if (!notificationId) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "notificationId is required",
        result: {},
      });
    }
    const patient = await Patient.findOne({ _id: token._id });
    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }
    const notification = await Notification.findOne({ _id: notificationId, patientId: patient._id });
    if (!notification) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Notification not found",
        result: {},
      });
    } 
    notification.seen = true;
    await notification.save();
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification marked as seen",
      result: {},
    });
  } catch (error) {
    console.error("Seen Notification Error:", error.message);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error in seen notification API",
      result: {},
    });
  }
};

export const deleteNotificationCaregiver = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const token = req.token;
    const caretaker = await Caretaker.findOne({ _id: token._id });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caregiver not found",
        result: {},
      });
    }
    const notification = await Notification.findOne({ _id:notificationId, caretakerId:caretaker._id });
    if (!notification) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Notification not found",
        result: {},
      });
    }
    notification.status = "Deleted";
    await notification.save();
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification deleted successfully",
      result: {},
    });
  } catch (error) {
    console.error("Delete Notification Error:", error.message);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error in delete notification API",
      result: {},
    });
  }
};
export const deleteNotificationGuardian = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const token = req.token;
    const guardian = await Guardian.findOne({ _id: token._id });
    if (!guardian) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Guardian not found",
        result: {},
      });
    }
    const notification = await Notification.findOne({ _id: notificationId, guardianId: guardian._id });
    if (!notification) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Notification not found",
        result: {},
      });
    }
    notification.status = "Deleted";
    await notification.save();
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification deleted successfully",
      result: {},
    });
  } catch (error) {
    console.error("Delete Notification Error:", error.message);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error in delete notification API",
      result: {},
    });
  }
};
