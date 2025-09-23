import Patient from "../models/patientModel.js";
import MedicalReport from "../models/medicalReportModel.js";

/**
 * ➤ Upload Multiple Medical Reports
 */
export const uploadMedicalReport = async (req, res) => {
  try {
    let accessToken = req.token;
    const { description } = req.body;

    // check patient
    const patient = await Patient.findOne({ accessToken });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    // multer se multiple files aayengi
    if (!req.files || req.files.length === 0) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "At least one file is required",
        result: {},
      });
    }

    let savedReports = [];

    for (let file of req.files) {
      // File type check
      let fileType = "";
      if (file.mimetype === "application/pdf") fileType = "PDF";
      else if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg")
        fileType = "JPG";
      else if (file.mimetype === "image/png") fileType = "PNG";
      else continue; // agar type allowed nahi hai to skip

      const report = new MedicalReport({
        patient_id: patient._id,
        fileUrl: file.path, // multer path / cloud path
        fileType,
        description,
      });

      await report.save();
      savedReports.push(report);
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Medical reports uploaded successfully",
      result: savedReports,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};


export const getMedicalReports = async (req, res) => {
  try {
    let accessToken = req.token;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // check patient
    const patient = await Patient.findOne({ accessToken });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const skip = (page - 1) * limit;

    // reports fetch
    const reports = await MedicalReport.find({ patient_id: patient._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalReport.countDocuments({ patient_id: patient._id });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Medical reports fetched successfully",
      result: {
        total,
        page,
        limit,
        reports,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};