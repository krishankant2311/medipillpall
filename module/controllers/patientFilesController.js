import PatientFile from "../models/patientFilesModel.js";
import Caretaker from "../models/caretakerModel/caretakerModel.js";
import Patient from "../models/patientModel.js";
import fs from "fs";
// -------------------- ADD PATIENT FILE BY CARETAKER --------------------
// export const addPatientFileByCaretaker = async (req, res) => {
//   try {
//     const token = req.token; // caretaker token
//     const { patientId } = req.params;
//     const { fileType, description, status } = req.body;

//     // Validate Caretaker
//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active",
//     });
//     if (!caretaker) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or inactive caretaker",
//       });
//     }

//     // Validate Patient
//     const patient = await Patient.findOne({
//       _id: patientId,
//       status: "Active",
//     });
//     if (!patient) {
//       return res.status(404).json({
//         success: false,
//         message: "Patient not found or inactive",
//       });
//     }

//     // 🧩 File path handling (multer)
//     let filePath = "";
//     if (req.file) {
//       // multer stores files inside "uploads/" folder
//       // create accessible URL path
//       filePath = `/uploads/${req.file.filename}`;
//     }

//     // Save file details in DB
//     const newFile = await PatientFile.create({
//       caretakerId: caretaker._id,
//       patientId,
//       file: filePath,
//       fileType: fileType || "",
//       description: description || "",
//       status: status || "",
//     });

//     // Return with full URL for access/download
//     return res.status(200).json({
//       success: true,
//       message: "File uploaded successfully",
//       result: {
//         ...newFile._doc,
//         fullFileURL: filePath ? `${req.protocol}://${req.get("host")}${filePath}` : "",
//       },
//     });
//   } catch (error) {
//     console.error("Error adding patient file:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

import path from "path";

export const addPatientFileByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params;
    const { description, status } = req.body;

    // 🧩 Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker",
      });
    }

    // 🧩 Validate Patient
    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active",
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // 🧩 File path handling (multer)
    let filePath = "";
    let fileType = "";
    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
      fileType = path.extname(req.file.originalname).replace(".", "").toUpperCase(); // e.g. JPG, PNG, PDF
    }

    // 🧩 Save file details in DB
    const newFile = await PatientFile.create({
      caretakerId: caretaker._id,
      patientId,
      file: filePath,
      fileType: fileType || "",
      description: description || "",
      status: "Active",
    });

    // 🧩 Return with full file URL for access/download
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      result: {
        ...newFile._doc,
        fullFileURL: filePath ? `${req.protocol}://${req.get("host")}${filePath}` : "",
      },
    });
  } catch (error) {
    console.error("Error adding patient file:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// -------------------- GET ALL PATIENT FILES BY CARETAKER --------------------
export const getAllPatientFilesByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;

    // Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker",
      });
    }

    // Validate Patient
    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active",
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // Fetch all uploaded files
    const files = await PatientFile.find({ patientId }).sort({ createdAt: -1 });

    const formattedFiles = files.map((f) => ({
      ...f._doc,
      fullFileURL: f.file ? `${req.protocol}://${req.get("host")}${f.file}` : "",
    }));

    return res.status(200).json({
      success: true,
      message: "Files fetched successfully",
      count: files.length,
      result: formattedFiles,
    });
  } catch (error) {
    console.error("Error fetching patient files:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// -------------------- GET SINGLE PATIENT FILE BY CARETAKER --------------------
export const getPatientFileByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId, fileId } = req.params;

    // Validate Caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker)
      return res.status(401).json({ success: false, message: "Invalid or inactive caretaker" });

    // Validate Patient
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient)
      return res.status(404).json({ success: false, message: "Patient not found or inactive" });

    // Find file
    const file = await PatientFile.findOne({
      _id: fileId,
      patientId,
      caretakerId: caretaker._id,
    });

    if (!file)
      return res.status(404).json({ success: false, message: "File not found" });

    // Construct full file URL
    const fullFileURL = `${req.protocol}://${req.get("host")}${file.file}`;

    return res.status(200).json({
      success: true,
      message: "File fetched successfully",
      result: {
        ...file._doc,
        fullFileURL,
      },
    });
  } catch (error) {
    console.error("Error fetching patient file:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// -------------------- DELETE PATIENT FILE BY CARETAKER --------------------
export const deletePatientFileByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId, fileId } = req.params;

    // 🧠 Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker",
      });
    }

    // 🧠 Validate Patient
    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active",
    });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // 🧩 Find file
    const file = await PatientFile.findOne({
      _id: fileId,
      patientId,
      caretakerId: caretaker._id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // 🧾 Soft Delete (Update Status)
    file.status = "Deleted";
    await file.save();

    return res.status(200).json({
      success: true,
      message: "File deleted (soft delete) successfully",
      result: file,
    });
  } catch (error) {
    console.error("Error deleting patient file:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

