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


// export const uploadPatientFile = async (req, res) => {
//   try {
//     const token = req.token; // from verifyToken middleware
//     const { documentType } = req.body;
//     const { patientId } = req.params;
//     // --- Validation ---
//     if (!patientId || !documentType) {
//       return res.status(400).json({
//         success: false,
//         message: "Patient ID and document type are required",
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Please upload a file",
//       });
//     }

//     // --- File Path ---
//     const fileUrl = `/uploads/patientFiles/${req.file.filename}`;
//     const fullFileURL = `${req.protocol}://${req.get("host")}${fileUrl}`;

//     // --- Prepare Save Data ---
//     const fileData = {
//       patientId,
//       documentType,
//       fileUrl,
//       fileName: req.file.originalname,
//       fileSize: (req.file.size / (1024 * 1024)).toFixed(2) + " MB",
//       status: "Active",
//       uploadedAt: new Date(),
//     };
//     console.log("Incoming Body:", req.body);

//     if (token.role === "Caretaker") fileData.caretakerId = token._id;
//     if (token.role === "Guardian") fileData.guardianId = token._id;

//     // --- Save in MongoDB ---
//     const file = await PatientFile.create(fileData);

//     // --- Add Full File URL for response ---
//     file._doc.fullFileURL = fullFileURL;

//     return res.status(200).json({
//       success: true,
//       message: "File uploaded successfully",
//       result: file,
//     });
//   } catch (err) {
//     console.error("❌ uploadPatientFile Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };



export const uploadPatientFile = async (req, res) => {
  try {
    const token = req.token; // caretaker identified from token
    const {  documentType } = req.body;

    const { patientId } = req.params;
    // 🧩 Validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    // 🧩 Build full URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // 🧩 Save in DB (fileUrl = full URL)
    const file = await PatientFile.create({
      caretakerId: token._id,
      patientId,
      documentType,
      fileUrl, // ✅ full URL stored here
      fileName: req.file.originalname,
      fileSize: (req.file.size / (1024 * 1024)).toFixed(2) + " MB",
      uploadedAt: new Date(),
      status: "Active",
    });

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      result: file,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};





// export const uploadPatientFile = async (req, res) => {
//   try {
//     const token = req.token; // guardian/caretaker identified from token
//     const { patientId, documentType } = req.body;

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Please upload a file",
//       });
//     }

//     const fileUrl = `/uploads/patientFiles/${req.file.filename}`;

//     const file = await PatientFile.create({
//       patientId,
//       uploadedBy: token._id,
//       documentType,
//       fileUrl,
//       fileName: req.file.originalname,
//       fileSize: (req.file.size / (1024 * 1024)).toFixed(2) + " MB",
//     });

//     return res.status(200).json({
//       success: true,
//       message: "File uploaded successfully",
//       result: file,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };


export const getUploadedFiles = async (req, res) => {
  try {
    const { patientId } = req.query;

    const filter = {};
    if (patientId) filter.patientId = patientId;

    const files = await PatientFile.find(filter)
      .populate("patientId", "fullName")
      .sort({ uploadedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Files fetched successfully",
      result: files,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};


export const getPatientFilesByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker identified from token
    const { patientId } = req.params;

    // 🧩 Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName status");

    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker token",
      });
    }

    // 🧩 Fetch files for given patient
    const files = await PatientFile.find({
      patientId,
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .select("documentType fileUrl fileName fileSize uploadedAt");

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: "No files found for this patient",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient files fetched successfully",
      result: files,
    });
  } catch (err) {
    console.error("Error fetching patient files:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
export const getAllFilesByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker identified from token

    // 🧩 Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName status");

    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker token",
      });
    }

    // 🧩 Get all files uploaded by this caretaker
    const files = await PatientFile.find({
      caretakerId: caretaker._id,
      status: "Active",
    })
      .populate({
        path: "patientId",
        select: "_id fullName age gender diseaseCondition",
      })
      .sort({ createdAt: -1 })
      .select(
        "_id documentType fileUrl fileName fileSize uploadedAt createdAt updatedAt status patientId"
      );

    if (!files.length) {
      return res.status(404).json({
        success: false,
        message: "No files found for this caretaker",
      });
    }

    // 🧩 Add full URL for file
    const result = files.map((file) => ({
      ...file._doc,
      fullFileURL: `${req.protocol}://${req.get("host")}${file.fileUrl}`,
    }));

    return res.status(200).json({
      success: true,
      message: "All files uploaded by caretaker fetched successfully",
      result,
    });
  } catch (err) {
    console.error("Error fetching files by caretaker:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export const getAllPatientsWithFilesByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token

    // 🧩 Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName status");

    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker token",
      });
    }

    // 🧩 Step 2: Find all active patients linked to this caretaker
    const patients = await Patient.find({
      caretakerId: caretaker._id,
      status: "Active",
    }).select("_id fullName age gender diseaseCondition");

    if (!patients.length) {
      return res.status(404).json({
        success: false,
        message: "No patients found for this caretaker",
      });
    }

    // 🧩 Step 3: For each patient → fetch files from PatientFile model
    const results = await Promise.all(
      patients.map(async (patient) => {
        const files = await PatientFile.find({
          patientId: patient._id,
          status: "Active",
        })
          .sort({ createdAt: -1 }).select(
"documentType fileUrl fileName fileSize uploadedAt createdAt updatedAt status")
        // Build full URL
        const filesWithFullURL = files.map((f) => ({
          ...f._doc,
          fullFileURL: `${req.protocol}://${req.get("host")}${f.file}`,
        }));

        return {
          ...patient._doc,
          files: filesWithFullURL,
        };
      })
    );

    // 🧩 Step 4: Send response
    return res.status(200).json({
      success: true,
      message: "Patients with files fetched successfully",
      result: results,
    });
  } catch (err) {
    console.error("Error fetching patients with files:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};


export const getAllPatientFiles = async (req, res) => {
  try {
    const token = req.token; // caretaker token

    // 🧩 Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id patients");

    if (!caretaker) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker",
        result: {},
      });
    }

    // 🧩 Step 2: If no patients assigned
    if (!caretaker.patients || caretaker.patients.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No patients assigned to this caretaker",
        result: [],
      });
    }

    // 🧩 Step 3: Fetch all files uploaded by caretaker for assigned patients
    const files = await PatientFile.find({
      caretakerId: caretaker._id,
      patientId: { $in: caretaker.patients },
      status: "Active",
    })
      .populate("patientId", "fullName age gender diseaseCondition")
      .sort({ createdAt: -1 })
      .select(
        "_id documentType fileUrl fileName fileSize uploadedAt createdAt updatedAt status patientId"
      );

    if (!files.length) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No files found for your assigned patients",
        result: [],
      });
    }

    // 🧩 Step 4: Format clean response
    const formattedFiles = files.map((file) => ({
      _id: file._id,
      patientId: file.patientId?._id,
      patientName: file.patientId?.fullName || "Unknown",
      age: file.patientId?.age || null,
      gender: file.patientId?.gender || null,
      diseaseCondition: file.patientId?.diseaseCondition || "",
      documentType: file.documentType,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileUrl: `${req.protocol}://${req.get("host")}${file.fileUrl}`,
      uploadedAt: file.uploadedAt,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      status: file.status,
    }));

    // 🧩 Step 5: Send response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "All files uploaded by caretaker fetched successfully",
      result: formattedFiles,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllPatientFilesByCaretaker controller",
      result: {},
    });
  }
};
