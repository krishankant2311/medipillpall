import Notification from "../models/notificationModel.js";
import Admin from "../models/adminModel.js";
// import Notification from "../models/Notification.js";
import Caretaker from "../../module/models/caretakerModel/caretakerModel.js"
import Guardian from "../../module/models/guardiansModel/guardianModel.js"
import dotenv from "dotenv";
dotenv.config();

export const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, userType, title, message, data, type } = req.body;

    // Required fields validation
    if (!userId || !userType || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, userType, title, and message are required",
      });
    }

    // Allowed user types
    const allowedTypes = ["Patient", "Caretaker", "Guardian"];
    if (!allowedTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userType. Allowed: Patient, Caregiver, Guardian",
      });
    }

    // Save notification to DB
    const notification = await Notification.create({
      userId,
      userType,
      title,
      message,
      data: data || {},
      type: type || "General", // e.g. Task, Alert, Vital, Payment, etc.
    });

    return res.status(200).json({
      success: true,
      message: "Notification saved successfully",
      result: notification,
    });

  } catch (error) {
    console.log("Error sending notification:", error);
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
      userId: token._id,
      userType: "Patient",
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

export const getCaretakerNotifications = async (req, res) => {
  try {
    const token = req.token; // Caretaker token

    if (!token || !token._id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const notifications = await Notification.find({
      userId: token._id,
      userType: "Caretaker",
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
      userId: token._id,
      userType: "Guardian",
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




export const registerPlayerIdPatient = async (req, res) => {
  try {
    const { playerId } = req.body;
    const token = req.token;

    if (!playerId) {
      return res.status(400).send({
        statusCode: 400,
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
      return res.status(400).send({
        statusCode: 400,
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
      return res.status(400).send({
        statusCode: 400,
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


  export const sendNotificationToGuardian = async (req, res) => {
  try {
    const { guardianId, title, message } = req.body;
    const token = req.token;

    if (!guardianId || !title || !message) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "guardianId, title & message are required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ _id: token._id });
    if (!admin || admin.status === "Delete") {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    const guardian = await Guardian.findOne({ _id: guardianId });
    if (!guardian) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Guardian not found",
        result: {},
      });
    }

    if (!guardian.playerId || !isValidUUID(guardian.playerId.trim())) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Guardian does not have a valid playerId",
        result: {},
      });
    }

    let imageUrl = "";
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    const notification = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [guardian.playerId.trim()],
      headings: { en: title },
      contents: { en: message },
    };

    if (imageUrl) {
      notification.big_picture = imageUrl;
      notification.ios_attachments = { id1: imageUrl };
    }

    const result = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      notification,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        },
      }
    );

    await Notification.create({
      sentByAdmin: token._id,
      guardianId,
      title,
      message,
      image: imageUrl,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to guardian successfully",
      result: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error sending notification",
      result: err.response?.data || err.message,
    });
  }
};


export const sendNotificationToPatient = async (req, res) => {
  try {
    const { patientId, title, message } = req.body;
    const token = req.token;

    if (!patientId || !title || !message) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "patientId, title & message are required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ _id: token._id });
    if (!admin || admin.status === "Delete") {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    const patient = await Patient.findOne({ _id: patientId });
    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    if (!patient.playerId || !isValidUUID(patient.playerId.trim())) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Patient does not have a valid playerId",
        result: {},
      });
    }

    let imageUrl = "";
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    const notification = {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [patient.playerId.trim()],
      headings: { en: title },
      contents: { en: message },
    };

    if (imageUrl) {
      notification.big_picture = imageUrl;
      notification.ios_attachments = { id1: imageUrl };
    }

    const result = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      notification,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        },
      }
    );

    await Notification.create({
      sentByAdmin: token._id,
      patientId,
      title,
      message,
      image: imageUrl,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to patient successfully",
      result: result.data,
    });

  } catch (err) {
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

    if (!caretakerId || !title || !message) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "caregiverId, title & message are required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ _id: token._id });
    if (!admin || admin.status === "Delete") {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    const caretaker = await Caretaker.findOne({ _id: caretakerId });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caregiver not found",
        result: {},
      });
    }

    if (!caretaker.playerId || !isValidUUID(caretaker.playerId.trim())) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Caregiver does not have a valid playerId",
        result: {},
      });
    }

    let imageUrl = "";
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    // ⭐ Correct App ID for Caretaker app
    const notification = {
      app_id: process.env.ONESIGNAL_CARETAKER_APP_ID,
      include_player_ids: [caretaker.playerId.trim()],
      headings: { en: title },
      contents: { en: message },
    };

    if (imageUrl) {
      notification.big_picture = imageUrl;
      notification.ios_attachments = { id1: imageUrl };
    }

    // ⭐ Using env API URL + correct caretaker rest key
    const result = await axios.post(
      process.env.ONESIGNAL_API,
      notification,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_CARETAKER_REST_KEY}`,
        },
      }
    );

    await Notification.create({
      sentByAdmin: token._id,
      caretakerId,
      title,
      message,
      image: imageUrl,
      status:"Sent"
      
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to caregiver successfully",
      result: result.data,
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error sending notification",
      result: err.response?.data || err.message,
    });
  }
};



export const sendToAllPatients = async (req, res) => {
  try {
    const { title, message, type, data } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Title & message required",
        result: {},
      });
    }

    const allPatients = await Patient.find({}, "_id");

    const notifications = allPatients.map(p => ({
      title,
      message,
      receiverType: "Patient",
      receiverId: p._id,
      type: type || "General",
      data: data || {},
    }));

    await Notification.insertMany(notifications);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to all patients",
      result: {},
    });

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};


export const sendToAllGuardians = async (req, res) => {
  try {
    const { title, message, type, data } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Title & message required",
        result: {},
      });
    }

    const allGuardians = await Guardian.find({}, "_id");

    const notifications = allGuardians.map(g => ({
      title,
      message,
      receiverType: "Guardian",
      receiverId: g._id,
      type: type || "General",
      data: data || {},
    }));

    await Notification.insertMany(notifications);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to all guardians",
      result: {},
    });

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};


export const sendToAllCaretakers = async (req, res) => {
  try {
    const { title, message, type, data } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Title & message required",
        result: {},
      });
    }

    const allCaretakers = await Caretaker.find({}, "_id");

    const notifications = allCaretakers.map(c => ({
      title,
      message,
      receiverType: "Caretaker",
      receiverId: c._id,
      type: type || "General",
      data: data || {},
    }));

    await Notification.insertMany(notifications);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to all caregivers",
      result: {},
    });

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
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
    // -------------------------------------------

    await Notification.create({
      title,
      message,
      imageUrl,
      sentTo: "Guardian",
      createdBy: admin._id,
      userType: "Guardian",
      status: "Sent",
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


const REST_KEY_PATIENT = "YOUR_PATIENT_REST_KEY_HERE";

const APP_ID_PATIENT = "YOUR_PATIENT_APP_ID_HERE";


export const sendNotificationToAllPatient = async (req, res) => {
  try {
    const { title, message, imageUrl } = req.body;

    // Send notification by tag filter
    const payload = {
      app_id: APP_ID_PATIENT,
      filters: [
        { field: "tag", key: "userType", relation: "=", value: "Patient" }
      ],
      headings: { en: title || "Default title" },
      contents: { en: message || "Default message" },
      big_picture: imageUrl || undefined,
      ios_attachments: imageUrl ? { id: imageUrl } : undefined
    };

    const resp = await axios.post(ONE_SIGNAL_API, payload, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${REST_KEY_PATIENT}`,
      },
    });

    // ================================
    // 🔥 SAVE NOTIFICATION IN DATABASE
    // ================================
    await Notification.create({
      title,
      message,
      imageUrl,
      sendTo: "Patient",
      createdBy: req.token._id,
      userType: "Patient"
    });

    return res.json({
      ok: true,
      message: "Notification sent to Patient users & saved to database",
      result: resp.data,
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err?.response?.data || err.message,
    });
  }
};


const APP_ID_CARETAKER = process.env.ONESIGNAL_CARETAKER_APP_ID;
const REST_KEY_CARETAKER = process.env.ONESIGNAL_CARETAKER_REST_KEY;


export const sendNotificationToAllCaretaker = async (req, res) => {
  try {
    const { title, message, imageUrl } = req.body;

    // ✅ Check if admin is valid
    const admin = await Admin.findOne({ _id: req.token._id, status: "Active" });
    if (!admin) {
      return res.status(403).json({
        ok: false,
        error: "Unauthorized or deleted admin",
      });
    }

    const payload = {
      app_id: APP_ID_CARETAKER,

      // 🔥 Send to all users (Caregiver devices)
      included_segments: ["All"],

      headings: { en: title || "Default title" },
      contents: { en: message || "Default message" },

      big_picture: imageUrl || undefined,
      ios_attachments: imageUrl ? { id: imageUrl } : undefined
    };

    // 🔥 Send Notification
    const resp = await axios.post(ONE_SIGNAL_API, payload, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: `Basic ${REST_KEY_CARETAKER}`,  // Caretaker key
      },
    });

    // ✅ Save notification to DB
    await Notification.create({
      title: title || "Default title",
      message: message || "Default message",
      imageUrl: imageUrl || null,
      userType: "Caretaker",
      type: "General",
      status: "Sent",
      sentToAll: true,
      onesignalResponse: {
        status: "sent",
        response: resp.data
      }
    });

    return res.json({
      success: true,
      message: "Notification sent to all Caregiver",
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

export const sendNotificationToAllApps = async (req, res) => {
  try {
    const { title, message, imageUrl } = req.body;
    const token = req.token;
    const admin = await Admin.findOne({ _id: req.token._id, status: "Active" });
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized admin",
      });
    }

    // 1️⃣ Payload
    const payload = {
      included_segments: ["All"],
      headings: { en: title },
      contents: { en: message },
      big_picture: imageUrl || undefined,
      ios_attachments: imageUrl ? { id: imageUrl } : undefined
    };

    // 2️⃣ Prepare All Three Configs
    const apps = [
      {
        appId: process.env.ONESIGNAL_APP_ID,
        key: process.env.ONESIGNAL_REST_KEY,
        userType: "Guardian"
      },
      {
        appId: process.env.ONESIGNAL_PATIENT_APP_ID,
        key: process.env.ONESIGNAL_PATIENT_REST_KEY,
        userType: "Patient"
      },
      {
        appId: process.env.ONESIGNAL_CARETAKER_APP_ID,
        key: process.env.ONESIGNAL_CARETAKER_REST_KEY,
        userType: "Caretaker"
      }
    ];

    let responses = [];

    // 3️⃣ Loop Each App → Send Notification
    for (let app of apps) {
      const body = { ...payload, app_id: app.appId };

      try {
        const resp = await axios.post(
          process.env.ONESIGNAL_API,
          body,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${app.key}`,
            },
          }
        );

        responses.push({
          userType: app.userType,
          status: "sent",
          onesignalId: resp.data.id || null,
          response: resp.data
        });

      } catch (err) {
        responses.push({
          userType: app.userType,
          status: "failed",
          error: err?.response?.data || err.message
        });
      }
    }

    // 4️⃣ SAVE NOTIFICATION IN DATABASE
    await Notification.create({
      title,
      message,
      imageUrl: imageUrl || null,
      userType: "All",
      type: "General",
      sentToAll: true,
      onesignalResponse: responses,
    });

    return res.json({
      success: true,
      message: "Notification sent to all three apps",
      responses,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};



export const getAdminNotifications = async (req, res) => {
  try {
    const token = req.token;
    const admin = await Admin.findOne({ _id: req.token._id, status: "Active" });
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized admin",
      });
    }

    // Pagination
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const notifications = await Notification.find()
      .sort({ createdAt: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments();

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


export const sendNotificationTospecificGuardian = async (req, res) => {
  try {
    const { guardianId, title, message } = req.body;

    // Validate required fields
    if (!guardianId || !title || !message) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "guardianId, title & message are required",
        result: {},
      });
    }

    // Validate admin
    const admin = await Admin.findOne({ _id: req.token._id, status: "Active" });
    if (!admin) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized or deleted admin",
        result: {},
      });
    }

    // Fetch guardian
    const guardian = await Guardian.findOne({ _id: guardianId });
    if (!guardian) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Guardian not found",
        result: {},
      });
    }

    // Validate playerId
    if (!guardian.playerId || !isValidUUID(guardian.playerId.trim())) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Guardian does not have a valid playerId",
        result: {},
      });
    }

    let imageUrl = "";
    if (req.file) {
      const sanitized = req.file.filename.replace(/\s+/g, "-");
      imageUrl = `${req.protocol}://${req.get("host")}/public/${sanitized}`;
    }

    // -------------------------------
    // OneSignal Payload
    // -------------------------------
    const payload = {
      app_id: process.env.ONESIGNAL_APP_ID,   // Guardian App ID
      include_player_ids: [guardian.playerId.trim()],
      headings: { en: title },
      contents: { en: message },
    };

    if (imageUrl) {
      payload.big_picture = imageUrl;
      payload.ios_attachments = { id1: imageUrl };
    }

    // -------------------------------
    // Send Notification
    // -------------------------------
    const response = await axios.post(
      process.env.ONESIGNAL_API,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.ONESIGNAL_REST_KEY}`, // Guardian REST Key
        },
      }
    );

    // -------------------------------
    // Save to DB
    // -------------------------------
    await Notification.create({
      sentByAdmin: req.token._id,
      guardianId,
      title,
      message,
      image: imageUrl,
    });

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Notification sent to guardian successfully",
      result: response.data,
    });

  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Error sending notification",
      result: err.response?.data || err.message,
    });
  }
};
