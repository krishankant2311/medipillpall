import Caretaker from "../../models/caretakerModel/caretakerModel.js";
import Admin from "../../models/adminModel.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../../helpers/jwt.js";
import genrateOTP from "../../../helpers/generateOtp.js";
import Patient from "../../models/patientModel.js"
import Medication from "../../models/medicationModel.js";
import PersonalContact from "../../models/patientPersonalContactModel.js";
import PatientRecord from "../../models/patientRecordModel.js";
import PatientTask from "../../models/patientTaskModel.js";
import Meal from "../../models/patientMealModel.js";
import mongoose from "mongoose";
import MedicationReminder from "../../models/reminderModel.js";
import MedicalReport from "../../models/medicalReportModel.js";
import Prescription from "../../models/prescriptionModel.js";
import FAQ from "../../models/patientFAQModel.js";
import TermsAndConditions from "../../models/termsAndConditionsModel.js";
import PrivacyPolicy from "../../models/privacyPolicyModel.js";
import MedicalHistory from "../../models/medicalHistoryModel.js";
import CareNote from "../../models/guardiansModel/careModel.js";
import HealthcareProvider from "../../models/healthcareProviderModel.js";

export const addCaretaker = async (req, res) => {
  try {
    let { fullName, mobileNumber, email, password } = req.body;

    fullName = fullName?.trim()?.toLowerCase();
    mobileNumber = mobileNumber?.trim();
    email = email?.trim()?.toLowerCase();
    password = password?.trim();

    if (!fullName) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Required fullName",
        result: {},
      });
    }

    if (!mobileNumber) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Required mobileNumber",
        result: {},
      });
    }

    if (!/^\d+$/.test(mobileNumber)) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "mobileNumber must contain only numbers",
        result: {},
      });
    }

    if (!email) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Required email",
        result: {},
      });
    }

    if (!password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Required password",
        result: {},
      });
    }

    if (password.length < 8) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Password must be at least 8 characters long",
        result: {},
      });
    }

    const caretakerExist = await Caretaker.findOne({
      $or: [{ mobileNumber }, { email }],
    });

    if (caretakerExist) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Caretaker already exists",
        result: {},
      });
    }

    const enc_password = bcrypt.hashSync(password, 10);

    const newCaretaker = new Caretaker({
      guardianId: null,
      fullName,
      mobileNumber,
      email,
      password: enc_password,
      status: "Active",
    });

    const accessToken = generateAccessToken({
      _id: newCaretaker._id,
      mobileNumber,
    });
    const refreshToken = generateRefreshToken({
      _id: newCaretaker._id,
      mobileNumber,
    });

    newCaretaker.accessToken = accessToken;
    newCaretaker.refreshToken = refreshToken;

    await newCaretaker.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Caretaker added successfully",
      result: newCaretaker,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in addCaretaker API",
    });
  }
};


// export const getAllCaretakersByAdmin = async (req, res) => {
//   try {
//     const token = req.token;
//     let { page = 1, limit = 10, search = "" } = req.query;
//     page = Number.parseInt(page);
//     limit = Number.parseInt(limit);
//     const skip = (page - 1) * limit;

//     const adminUser = await Admin.findOne({ _id: token._id, status: "Active" });
//     if (!adminUser) {
//       return res.status(403).send({
//         statusCode: 403,
//         success: false,
//         message: "Access denied: Admins only",
//         result: {},
//       });
//     }

//     if (adminUser.status === "Delete") {
//       return res.send({
//         statusCode: 403,
//         success: false,
//         message: "Your account has been deleted",
//         result: {},
//       });
//     }

//     const searchRegex = new RegExp(search.trim(), "i");

//     const searchFilter = search.trim()
//       ? {
//           status: { $ne: "Delete" },
//           $or: [
//             { fullName: { $regex: searchRegex } },
//             { mobileNumber: { $regex: searchRegex } },
//             { email: { $regex: searchRegex } },
//           ],
//         }
//       : { status: { $ne: "Delete" } };

//     const caretakers = await Caretaker.find(searchFilter)
//       .select("-password -refreshToken")
//       .skip(skip)
//       .limit(limit);

//     const totalCaretakers = await Caretaker.countDocuments(searchFilter);

//     return res.send({
//       statusCode: 200,
//       success: true,
//       message: "All caretakers fetched successfully (Admin)",
//       result: {
//         caretakers,
//         currentPage: page,
//         totalPage: Math.ceil(totalCaretakers / limit),
//         totalRecord: totalCaretakers,
//       },
//     });
//   } catch (error) {
//     return res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in getAllCaretakersByAdmin API",
//       result: {},
//     });
//   }
// };


export const getAllCaretakersByAdmin = async (req, res) => {
  try {
    const token = req.token;
    let { page = 1, limit = 10, search = "", statusFilter = "all" } = req.query;

    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    const skip = (page - 1) * limit;

    // --- Validate Admin ---
    const adminUser = await Admin.findById(token._id);
    if (!adminUser || adminUser.status !== "Active") {
      return res.status(403).send({
        statusCode: 403,
        success: false,
        message: "Access denied: Admins only",
        result: {},
      });
    }

    // --- Search Regex ---
    const searchRegex = new RegExp(search.trim(), "i");

    // --- Status Filter ---
    let statusCondition = {};
    if (statusFilter === "Active") {
      statusCondition = { status: "Active" };
    } else if (statusFilter === "Blocked") {
      statusCondition = { status: "Blocked" };
    } else {
      statusCondition = { status: { $nin: ["Pending", "Delete"] } };
    }

    // --- Final search ---
    const searchFilter = search.trim()
      ? {
          ...statusCondition,
          $or: [
            { fullName: { $regex: searchRegex } },
            { email: { $regex: searchRegex } },
            { mobileNumber: { $regex: searchRegex } },
          ],
        }
      : { ...statusCondition };

    // --- Fetch Caretakers ---
    const caretakers = await Caretaker.find(searchFilter).select("-password -refreshToken -otp -accessToken")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({
        path: "patients",
        match: { status: "Active" },
        select: "fullName age diseaseCondition gender mobileNumber createdAt",
      })
      .populate({
        path: "guardianId",
        match: { status: "Active" },
        select: "fullName email mobileNumber createdAt",
      });

    // --- Count ---
    const totalCaretakers = await Caretaker.countDocuments(searchFilter);

    // --- Add guardian + patient count ---
    const caretakersWithCount = caretakers.map((ct) => ({
      ...ct.toObject(),
      totalPatients: ct.patients?.length || 0,
      totalGuardians: ct.guardianId ? 1 : 0,
    }));

    // --- Response ---
    return res.send({
      statusCode: 200,
      success: true,
      message: "All caretakers fetched successfully (Admin)",
      result: {
        caretakers: caretakersWithCount,
        currentPage: page,
        totalPage: Math.ceil(totalCaretakers / limit),
        totalRecord: totalCaretakers,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllCaretakersByAdmin API",
      result: {},
    });
  }
};



//working fine
// export const getAllCaretakersByAdmin = async (req, res) => {
//   try {
//     const token = req.token;
//     let { page = 1, limit = 10, search = "" } = req.query;

//     page = Number.parseInt(page);
//     limit = Number.parseInt(limit);
//     const skip = (page - 1) * limit;

//     // --- Step 1: Validate Admin ---
//     const adminUser = await Admin.findById(token._id);
//     if (!adminUser || adminUser.status !== "Active") {
//       return res.status(403).send({
//         statusCode: 403,
//         success: false,
//         message: "Access denied: Admins only",
//         result: {},
//       });
//     }

//     // --- Step 2: Search & Filter ---
//     const searchRegex = new RegExp(search.trim(), "i");

//     const searchFilter = search.trim()
//       ? {
//           status: { $nin: ["Pending", "Delete"] }, // <-- updated
//           $or: [
//             { fullName: { $regex: searchRegex } },
//             { email: { $regex: searchRegex } },
//             { mobileNumber: { $regex: searchRegex } },
//           ],
//         }
//       : { status: { $nin: ["Pending", "Delete"] } }; // <-- updated

//     // --- Step 3: Fetch Caretakers ---
//     const caretakers = await Caretaker.find(searchFilter)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 })
//       .populate({
//         path: "patients",
//         match: { status: "Active" },
//         select: "fullName age diseaseCondition gender mobileNumber createdAt",
//       });

//     // --- Step 4: Count ---
//     const totalCaretakers = await Caretaker.countDocuments(searchFilter);

//     // --- Step 5: Add total patient count ---
//     const caretakersWithCount = caretakers.map((ct) => ({
//       ...ct.toObject(),
//       totalPatients: ct.patients?.length || 0,
//     }));

//     // --- Step 6: Response ---
//     return res.send({
//       statusCode: 200,
//       success: true,
//       message: "All caretakers fetched successfully (Admin)",
//       result: {
//         caretakers: caretakersWithCount,
//         currentPage: page,
//         totalPage: Math.ceil(totalCaretakers / limit),
//         totalRecord: totalCaretakers,
//       },
//     });
//   } catch (error) {
//     return res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in getAllCaretakersByAdmin API",
//       result: {},
//     });
//   }
// };



// ------------------- LOGIN (send OTP) -------------------
export const caretakerLogin = async (req, res) => {
  try {
    let { mobileNumber } = req.body;
    mobileNumber = mobileNumber?.trim();

    if (!mobileNumber) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "mobileNumber required",
        result: {},
      });
    }

    const caretaker = await Caretaker.findOne({ mobileNumber });
    if (!caretaker) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "caretaker not found",
        result: {},
      });
    }

    if (caretaker.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "user has been deleted",
        result: {},
      });
    }

    const { otpValue, otpExpiry } = genrateOTP();

    caretaker.otp = {
      otpValue,
      otpExpiry,
    };

    await caretaker.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP sent successfully",
      result: {
        otpValue,
        otpExpiry,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in caretaker login API",
      result: {},
    });
  }
};

// ------------------- VERIFY OTP -------------------
export const verifyCaretakerOTP = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Mobile number and OTP are required",
        result: {},
      });
    }

    const caretaker = await Caretaker.findOne({ mobileNumber });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found",
        result: {},
      });
    }

    if (!caretaker.otp) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "OTP has not been generated yet",
        result: {},
      });
    }
    //  console.log("Caretaker OTP object:", caretaker.otp);
    if (!caretaker.otp.otpValue) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "OTP value is missing",
        result: {},
      });
    }
    // console.log("Caretaker OTP value:", caretaker.otp.otpValue);

    const currentTime = new Date();
    if (caretaker.otp.otpExpiry < currentTime) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "OTP has expired. Please request a new one",
        result: {},
      });
    }

    if (caretaker.otp.otpValue !== otp) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid OTP",
        result: {},
      });
    }

    const accessToken = generateAccessToken({ _id: caretaker._id, mobileNumber });
    const refreshToken = generateRefreshToken({ _id: caretaker._id, mobileNumber });

    caretaker.otp = {};
    caretaker.status = "Active";
    caretaker.accessToken = accessToken;
    caretaker.refreshToken = refreshToken;
    await caretaker.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "OTP verified successfully",
      result: {
        caretaker,
      },
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

// ------------------- PROFILE -------------------
export const caretakerProfile = async (req, res) => {
  try {
    const token = req.token;
    const caretaker = await Caretaker.findById(token._id).select("-password -otp -accessToken -refreshToken");

    if (!caretaker) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Caretaker profile fetched successfully",
      result: caretaker,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in caretaker profile API",
      result: {},
    });
  }
};

// ------------------- LOGOUT -------------------
export const caretakerLogout = async (req, res) => {
  try {
    const token = req.token;

    const caretaker = await Caretaker.findById(token._id);
    if (!caretaker) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found",
        result: {},
      });
    }

    caretaker.otp = {};
    await caretaker.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Caretaker logged out successfully",
      result: {},
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in caretaker logout API",
      result: {},
    });
  }
};

export const signupCaretaker = async (req, res) => {
  try {
    // Step 1: Extract data from request body in one line
    let { fullName, mobileNumber, email } = req.body;

    // Step 2: Trim and normalize
    fullName = fullName?.trim()?.toLowerCase();
    mobileNumber = mobileNumber?.trim();
    email = email?.trim()?.toLowerCase();

    // Step 3: Validate inputs
    if (!fullName) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Required fullName",
        result: {},
      });
    }

    if (!mobileNumber) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Required mobileNumber",
        result: {},
      });
    }

    // if (!/^\d+$/.test(mobileNumber)) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     success: false,
    //     message: "mobileNumber must contain only numbers",
    //     result: {},
    //   });
    // }

    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Required email",
        result: {},
      });
    }

    // Step 4: Check if caretaker already exists
    const caretakerExist = await Caretaker.findOne({
      $or: [{ mobileNumber }, { email }],
    });

    // Step 5: If caretaker exists
    if (caretakerExist) {
      // Step 5a: If status is Pending → resend OTP allowed
      if (caretakerExist.status === "Pending") {
        const { otpValue, otpExpiry } = genrateOTP();
        caretakerExist.otp = { otpValue, otpExpiry };
        await caretakerExist.save();

        return res.status(200).json({
          statusCode: 200,
          success: true,
          message: "OTP resent successfully",
          result: {
            mobileNumber: caretakerExist.mobileNumber,
            otpValue,
            otpExpiry,
          },
        });
      }

      // Step 5b: If status is Active → cannot add again
      if (caretakerExist.status === "Active") {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "Caretaker already exists",
          result: {},
        });
      }
    }

    // Step 6: If caretaker does not exist → generate OTP
    const { otpValue, otpExpiry } = genrateOTP();

    // Step 7: Create new caretaker instance with Pending status
    // const enc_password = bcrypt.hashSync(password, 10);

    const newCaretaker = new Caretaker({
      fullName,
      mobileNumber,
      email,
      // password: enc_password,
      status: "Pending",
      otp: { otpValue, otpExpiry },
    });

    // Step 8: Save new caretaker to DB
    await newCaretaker.save();

    // Step 9: Respond with OTP info
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "OTP sent successfully",
      result: { mobileNumber, otpValue, otpExpiry },
    });

  } catch (error) {
    // Step 10: Catch any errors
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};

// export const logoutCaretaker = async (req, res) => {
//   try {
//     const token = req.token;

//     const caretaker = await Caretaker.findOne({ _id: token._id });
//     if (!caretaker) {
//       return res.send({
//         statusCode: 404,
//         success: false,
//         message: "Caretaker not found",
//         result: {},
//       });
//     }

//     if (caretaker.status === "Delete") {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Caretaker has been deleted",
//         result: {},
//       });
//     }

//     if (caretaker.accessToken === "") {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Unauthorised access",
//         result: {},
//       });
//     }

//     caretaker.accessToken = "";
//     await caretaker.save();

//     return res.send({
//       statusCode: 200,
//       success: true,
//       message: "Caretaker logout successfully",
//       result: {},
//     });
//   } catch (error) {
//     return res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in caretaker logout API",
//       result: {},
//     });
//   }
// };

export const resendCaretakerOTPforSignup = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Step 1: Validate mobile number
    if (!mobileNumber) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Mobile number is required",
        result: {},
      });
    }

    // Step 2: Find caretaker
    const caretaker = await Caretaker.findOne({ mobileNumber });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found",
        result: {},
      });
    }

    // Step 3: Check status
    if (caretaker.status === "Active") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Caretaker already verified. Please login instead.",
        result: {},
      });
    }

    if (caretaker.status === "Delete") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Caretaker has been deleted",
        result: {},
      });
    }

    // Step 4: OTP cooldown check
    const now = new Date();
    if (caretaker.otp?.otpExpiry) {
      const otpSentTime = new Date(caretaker.otp.otpExpiry.getTime() - 5 * 60 * 1000);
      const diffSeconds = (now - otpSentTime) / 1000;

      if (diffSeconds < 30) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Please wait ${Math.ceil(30 - diffSeconds)} seconds before requesting a new OTP`,
          result: {},
        });
      }
    }

    // Step 5: Generate new OTP
    const { otpValue, otpExpiry } = genrateOTP();

    // Step 6: Update caretaker’s OTP
    caretaker.otp = { otpValue, otpExpiry };
    await caretaker.save();

    // Step 7: Response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "OTP resent successfully",
      result: { mobileNumber, otpValue, otpExpiry },
    });

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " Error in resendCaretakerOTPforSignup API",
      result: {},
    });
  }
};


// ========================
// RESEND OTP FOR LOGIN
// ========================
export const resendCaretakerOTPforLogin = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Step 1: Validate mobile number
    if (!mobileNumber) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Mobile number is required",
        result: {},
      });
    }

    // Step 2: Find caretaker
    const caretaker = await Caretaker.findOne({ mobileNumber });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found",
        result: {},
      });
    }

    // Step 3: Must be Active for login
    if (caretaker.status !== "Active") {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Caretaker is not active. Please signup first.",
        result: {},
      });
    }

    // Step 4: OTP cooldown check
    const now = new Date();
    if (caretaker.otp?.otpExpiry) {
      const otpSentTime = new Date(caretaker.otp.otpExpiry.getTime() - 5 * 60 * 1000);
      const diffSeconds = (now - otpSentTime) / 1000;

      if (diffSeconds < 30) {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: `Please wait ${Math.ceil(30 - diffSeconds)} seconds before requesting a new OTP`,
          result: {},
        });
      }
    }

    // Step 5: Generate new OTP
    const { otpValue, otpExpiry } = genrateOTP();

    // Step 6: Update caretaker’s OTP
    caretaker.otp = { otpValue, otpExpiry };
    await caretaker.save();

    // Step 7: Response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "OTP resent successfully",
      result: { mobileNumber, otpValue, otpExpiry },
    });

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " Error in resendCaretakerOTPforLogin API",
      result: {},
    });
  }
};

export const getAllMedicationsByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    let { patient_id, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate patient_id
    if (!patient_id) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Patient ID is required",
        result: {},
      });
    }

    // Step 3: Check if patient exists
    const patient = await Patient.findOne({ _id: patient_id, status: "Active" });
    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    // Optional: Step 4 — Verify caretaker is authorized for this patient
    // (Uncomment if you maintain caretaker–patient mapping)
    const isLinked = await Patient.findOne({ caretakerId: token._id, _id: patient_id });
    if (!isLinked) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Caretaker not authorized to view this patient's data",
        result: {},
      });
    }

    // Step 5: Fetch medication count and list
    const totalMedications = await Medication.countDocuments({ patient_id });

    const medications = await Medication.find({ patient_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Step 6: Return response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Patient medications fetched successfully",
      result: {
        patient_id,
        total: totalMedications,
        page,
        limit,
        totalPages: Math.ceil(totalMedications / limit),
        medications,
      },
    });

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllMedicationsByCaretaker API",
      result: {},
    });
  }
};

export const getPatientPersonalContactByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patient_id } = req.params; // or req.params if route uses param

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate patient_id
    if (!patient_id) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Patient ID is required",
        result: {},
      });
    }

    // Step 3: Validate patient
    const patient = await Patient.findOne({ _id: patient_id, status: "Active" });
    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    // Optional: Step 4 — Check caretaker–patient link
    // const isLinked = await CaretakerPatient.findOne({ caretaker_id: caretaker._id, patient_id });
    // if (!isLinked) {
    //   return res.status(403).json({
    //     statusCode: 403,
    //     success: false,
    //     message: "Caretaker not authorized to view this patient's data",
    //     result: {},
    //   });
    // }

    // Step 5: Fetch patient personal contact from separate schema
    const personalContact = await PersonalContact.findOne({
      patient_id,
      status: "Active",
    });

    if (!personalContact) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Personal contact not found for this patient",
        result: {},
      });
    }

    // Step 6: Return data
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Patient personal contact fetched successfully",
      result: {
        patient_id: patient._id,
        patientName: patient.name,
        personalContact,
      },
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getPatientPersonalContactByCaretaker API",
      result: {},
    });
  }
};

// export const getAllPatientsOfCaretaker = async (req, res) => {
//   try {
//     const token = req.token;

//     // Step 1: Validate caretaker
//     const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
//     if (!caretaker) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "Caretaker not found or inactive",
//         result: {},
//       });
//     }

//     // Step 2: Fetch all patients linked to caretaker
//     const patients = await Patient.find({ caretakerId: caretaker._id, status: "Active" })
//       .select("_id fullName age gender status condition");

//     if (!patients.length) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "No patients linked with this caretaker",
//         result: {},
//       });
//     }

//     // Step 3: Fetch each patient’s personal contact
//     const result = await Promise.all(
//       patients.map(async (patient) => {
//         const contact = await PersonalContact.findOne({
//           patientId: patient._id,
//           status: "Active",
//         }).select("name relation phone address status condition");

//         return {
//           patient_id: patient._id,
//           name: patient.fullName,
//           age: patient.age,
//           gender: patient.gender,
//           personalContact: contact || null,
//           condition: patient.condition,
//         };
//       })
//     );

//     // Step 4: Return response
//     return res.status(200).json({
//       statusCode: 200,
//       success: true,
//       message: "Patients fetched successfully",
//       result: result,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in getAllPatientsOfCaretaker API",
//       result: {},
//     });
//   }
// };

export const getAllPatientsOfCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { name, age, gender, mobileNumber } = req.query;
    const { search } = req.query;
    // 🧩 Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // 🧩 Step 2: Build dynamic filter
    let filter = {
      caretakerId: caretaker._id,
      status: "Active",
    };

    if (name) {
      filter.fullName = { $regex: name, $options: "i" };
    }

    if (mobileNumber) {
      filter.mobileNumber = { $regex: mobileNumber, $options: "i" };
    }

    if (age) {
      filter.age = age;
    }

    if (gender) {
      filter.gender = gender;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
        { condition: { $regex: search, $options: "i" } },
      ];
    }

    // 🧩 Step 3: Fetch patients with selected details
    const patients = await Patient.find(filter)
      .select(
        "_id fullName age gender mobileNumber email profilePhoto status diseaseCondition"
      )
      .sort({ createdAt: -1 });

    if (!patients.length) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No patients found for this caretaker",
        result: [],
      });
    }

    // 🧩 Step 4: Fetch Personal Contacts
    const result = await Promise.all(
      patients.map(async (patient) => {
        const contact = await PersonalContact.findOne({
          patientId: patient._id,
          status: "Active",
        }).select("name relation phone address");

        return {
          patient_id: patient._id,
          name: patient.fullName,
          age: patient.age,
          gender: patient.gender,
          mobileNumber: patient.mobileNumber,
          email: patient.email,
          condition: patient.diseaseCondition || "Not specified",
          profilePhoto: patient.profilePhoto || null,
          personalContact: patient.mobileNumber || null,
        };
      })
    );

    // 🧩 Step 5: Send response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Patients fetched successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllPatientsOfCaretaker API",
      result: {},
    });
  }
};

// export const getAllPatientsOfCaretaker = async (req, res) => {
//   try {
//     const token = req.token;

//     // Step 1: Validate caretaker
//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active",
//     });

//     if (!caretaker) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "Caretaker not found or inactive",
//         result: {},
//       });
//     }

//     // Step 2: Fetch all patients linked to caretaker
//     const patients = await Patient.find({
//       caretakerId: caretaker._id,
//       status: "Active",
//     }).select("_id fullName age gender status condition");

//     if (!patients.length) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "No patients linked with this caretaker",
//         result: {},
//       });
//     }

//     // Step 3: Fetch each patient’s personal contact
//     const result = await Promise.all(
//       patients.map(async (patient) => {
//         const contact = await PersonalContact.findOne({
//           patientId: patient._id,
//           status: "Active",
//         }).select("name relation phone address status condition");

//         return {
//           patient_id: patient._id,
//           name: patient.fullName,
//           age: patient.age,
//           gender: patient.gender,
//           condition: patient.condition || "Not specified", // 🔥 ensure visible
//           personalContact: contact || null,
//         };
//       })
//     );

//     // Step 4: Return response
//     return res.status(200).json({
//       statusCode: 200,
//       success: true,
//       message: "Patients fetched successfully",
//       result: result,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in getAllPatientsOfCaretaker API",
//       result: {},
//     });
//   }
// };


export const getActiveMedicationsByPatient = async (req, res) => {
  try {
    const token = req.token;
    let { page = 1, limit = 10 } = req.query;
    let { patient_id } = req.params;

    page = parseInt(page);
    limit = parseInt(limit);

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate patient_id
    if (!patient_id) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Patient ID is required",
        result: {},
      });
    }

    // Step 3: Check if patient exists
    const patient = await Patient.findOne({ _id: patient_id, status: "Active" });
    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    // Step 4: Verify caretaker–patient relationship
    const isLinked = await Caretaker.findOne({
      _id: token._id,
      patients: patient_id, // check if patient is in caretaker’s patients array
    });

    if (!isLinked) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Caretaker not authorized to view this patient's medications",
        result: {},
      });
    }

    // Step 5: Fetch active medications
    const query = { patient_id, status: "Active" };

    const totalActive = await Medication.countDocuments(query);

    const medications = await Medication.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // ✅ Step 6: Check if no medications found
    if (medications.length === 0) {
      return res.status(200).json({
        statusCode: 200,
        success: true,
        message: "This patient has no active medications",
        result: {
          patient_id,
          total: 0,
          page,
          limit,
          totalPages: 0,
          medications: [],
        },
      });
    }

    // Step 7: Return response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Active medications fetched successfully",
      result: {
        patient_id,
        total: totalActive,
        page,
        limit,
        totalPages: Math.ceil(totalActive / limit),
        medications,
      },
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getActiveMedicationsByPatient API",
      result: {},
    });
  }
};


// export const getPatientByCaretaker = async (req, res) => {
//   try {
//     const token = req.token;
//     const { patient_id } = req.params;

//     // Step 1: Validate caretaker
//     const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
//     if (!caretaker) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "Caretaker not found or inactive",
//         result: {},
//       });
//     }

//     // Step 2: Validate input
//     if (!patient_id) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Patient ID is required",
//         result: {},
//       });
//     }

//     // Step 3: Verify caretaker-patient relationship
//     const caretakerPatient = await Caretaker.findOne({
//          _id: token._id,
//       patient_id,
//     });

//     if (!caretakerPatient) {
//       return res.status(403).json({
//         statusCode: 403,
//         success: false,
//         message: "This patient is not assigned to you",
//         result: {},
//       });
//     }

//     // Step 4: Fetch patient details
//     const patient = await Patient.findOne({ _id: patient_id, status: "Active" })
//       // .populate("contact") // optional if you have a Contact schema
//       .select("-password -otp -__v");

//     if (!patient) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "Patient not found or inactive",
//         result: {},
//       });
//     }

//     // Step 5: Return response
//     return res.status(200).json({
//       statusCode: 200,
//       success: true,
//       message: "Patient details fetched successfully",
//       result: patient,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in getPatientByCaretaker API",
//       result: {},
//     });
//   }
// };



//


//



export const getPatientByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patient_id } = req.params;

    // 🧩 Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // 🧩 Step 2: Validate patient ID
    if (!patient_id) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Patient ID is required",
        result: {},
      });
    }

    // 🧩 Step 3: Verify caretaker–patient relationship
    const isAssigned =
      caretaker.patients &&
      caretaker.patients.some(
        (p) => p.toString() === patient_id.toString()
      );

    // if (!isAssigned) {
    //   return res.status(403).json({
    //     statusCode: 403,
    //     success: false,
    //     message: "This patient is not assigned to you",
    //     result: {},
    //   });
    // }

    // 🧩 Step 4: Fetch patient’s core details
    const patient = await Patient.findOne({
      _id: patient_id,
      status: "Active",
    })
      .select(
        "_id fullName age gender mobileNumber email profilePhoto condition department createdAt updatedAt"
      )
      .lean();

    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

     let doctorInfo = null;
    const doctor = await HealthcareProvider.findOne({
      patient_id: patient._id,
      status: "Active",
    }).select("_id doctorName speciality specialization phone email hospitalPhone hospitalOrClinic");

    if (doctor) doctorInfo = doctor;


    // 🧩 Step 6: Fetch emergency contact details (if any)
   const emergency = await PersonalContact.findOne({ 
  patient_id: patient_id,
  status: "Active",
}).select("contactName phoneNo relationship");

    return res.status(200).json({
  success: true,
  message: "Patient fetched successfully",
  data: {
    patientDetails: {
      name: patient.fullName,
      gender: patient.gender,
      dob: patient.dob,
      bloodGroup: patient.bloodGroup,
    },
 doctorInfo: doctorInfo
          ? {
              id: doctorInfo._id,
              name: doctorInfo.doctorName,
              department: doctorInfo.department,
              specialization: doctorInfo.speciality,
              contact: doctorInfo.phone,
              hostname: doctorInfo.hospitalOrClinic,
              hospitalPhone: doctorInfo.hospitalPhone,
              email: doctorInfo.email,
            }
          : null,
          
    emergencyDetails: {
      contact: emergency
        ? {
            name: emergency.contactName,
            phone: emergency.phoneNo,
            relation: emergency.relationship,
          }
        : null,
      dnrForm: patient.dnrForm || null,
    },
  },
});

    // 🧩 Step 8: Return response
  
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getPatientByCaretaker API",
      result: {},
    });
  }
};

// export const getPatientByCaretaker = async (req, res) => {
//   try {
//     const token = req.token;
//     const { patient_id } = req.params;

//     // Step 1: Validate caretaker
//     const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
//     if (!caretaker) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "Caretaker not found or inactive",
//         result: {},
//       });
//     }

//     // Step 2: Validate input
//     if (!patient_id) {
//       return res.status(400).json({
//         statusCode: 400,
//         success: false,
//         message: "Patient ID is required",
//         result: {},
//       });
//     }

//     // Step 3: Verify caretaker-patient relationship
//     const isAssigned = caretaker.patients.some(
//       (p) => p.toString() === patient_id.toString()
//     );

//     if (!isAssigned) {
//       return res.status(403).json({
//         statusCode: 403,
//         success: false,
//         message: "This patient is not assigned to you",
//         result: {},
//       });
//     }

//     // Step 4: Fetch patient details
//     const patient = await Patient.findOne({ _id: patient_id, status: "Active" })
//       .select("-password -otp -__v");

//     if (!patient) {
//       return res.status(404).json({
//         statusCode: 404,
//         success: false,
//         message: "Patient not found or inactive",
//         result: {},
//       });
//     }

//     // Step 5: Return response
//     return res.status(200).json({
//       statusCode: 200,
//       success: true,
//       message: "Patient details fetched successfully",
//       result: patient,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in getPatientByCaretaker API",
//       result: {},
//     });
//   }
// };

export const getAllPatientTasksByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patient_id } = req.params;

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate input
    if (!patient_id) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Patient ID is required",
        result: {},
      });
    }

    // Step 3: Verify caretaker-patient relationship
    const isAssigned = caretaker.patients.some(
      (p) => p.toString() === patient_id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "This patient is not assigned to you",
        result: {},
      });
    }

    // Step 4: Fetch all tasks of this patient
    const patientTasks = await PatientTask.find({ patient_id }).sort({ createdAt: -1 });

    if (!patientTasks || patientTasks.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No tasks found for this patient",
        result: [],
      });
    }

    // Step 5: Return response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "All patient tasks fetched successfully",
      result: patientTasks,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllPatientTasksByCaretaker API",
      result: {},
    });
  }
};

export const getSinglePatientTaskByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patient_id, task_id } = req.params;

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate input
    if (!patient_id || !task_id) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Patient ID and Task ID are required",
        result: {},
      });
    }

    // Step 3: Verify caretaker-patient relationship
    const isAssigned = caretaker.patients.some(
      (p) => p.toString() === patient_id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "This patient is not assigned to you",
        result: {},
      });
    }

    // Step 4: Fetch task
    const task = await PatientTask.findOne({
      _id: task_id,
      patient_id: patient_id,
    });

    if (!task) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Task not found for this patient",
        result: {},
      });
    }

    // Step 5: Return response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Patient task fetched successfully",
      result: task,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getSinglePatientTaskByCaretaker API",
      result: {},
    });
  }
};

export const getPatientRecordByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patient_id } = req.params;

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate input
    if (!patient_id) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Patient ID is required",
        result: {},
      });
    }

    // Step 3: Verify caretaker-patient relationship
    const isAssigned = caretaker.patients.some(
      (p) => p.toString() === patient_id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "This patient is not assigned to you",
        result: {},
      });
    }

    // Step 4: Fetch patient record(s) from PatientRecord model
    const records = await PatientRecord.find({ patient_id }).sort({ createdAt: -1 });

    if (!records || records.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No records found for this patient",
        result: [],
      });
    }

    // Step 5: Return response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Patient record(s) fetched successfully",
      result: records,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getPatientRecordByCaretaker API",
      result: {},
    });
  }
};

export const addMedicationByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params;
    const { medicationName, dosage, times, startingDate, reason } = req.body;

    // --- Validation ---
    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient ID is required in params",
        result: {},
      });
    }

    if (!medicationName?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Medication name is required",
        result: {},
      });
    }

    if (!dosage?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Dosage is required",
        result: {},
      });
    }

    if (!times || !Array.isArray(times) || times.length === 0) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "At least one time entry is required",
        result: {},
      });
    }

    if (!startingDate) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Starting date is required",
        result: {},
      });
    }

    if (!reason?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Reason is required",
        result: {},
      });
    }

    // --- Step 1: Verify Caretaker ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Step 2: Verify Patient belongs to this Caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
      status: "Active",
    });

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // --- Step 3: Create Medication record ---
    const newMedication = new Medication({
      patientId: patient._id,
      caretakerId: caretaker._id,
      medicationName: medicationName.trim(),
      dosage: dosage.trim(),
      times,
      startingDate,
      reason: reason.trim(),
      status: "Active",
    });

    await newMedication.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Medication added successfully for the patient",
      result: newMedication,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in addMedicationByCaretaker API",
      result: {},
    });
  }
};

export const getAllMealsByCaretakerForPatient = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params; // patient ID from params
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // --- Step 1: Validate caretaker ---
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Step 2: Validate patient belongs to caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: new mongoose.Types.ObjectId(caretaker._id),
      status: "Active",
    });
    console.log("Caretaker ID:", caretaker._id);
    console.log("Patient ID:", patientId);

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // --- Step 3: Fetch meals ---
    const meals = await Meal.find({
      patientId: patient._id,
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Optional: get total count for pagination
    const totalMeals = await Meal.countDocuments({
      patientId: patient._id,
      status: "Active",
    });

    if (meals.length === 0) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No meals found for this patient",
        result: { meals: [], totalMeals: 0 },
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Meals fetched successfully",
      result: {
        meals,
        totalMeals,
        currentPage: page,
        totalPages: Math.ceil(totalMeals / limit),
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllMealsByCaretakerForPatient API",
      result: {},
    });
  }
};

export const getActiveMedicationsByCaretakerForPatient = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params; // patient ID from params
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // --- Step 1: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Step 2: Validate Patient belongs to Caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // --- Step 3: Fetch Active Medications ---
    const medications = await Medication.find({
      patientId: patient._id,
      caretakerId: caretaker._id,
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Count total active meds for pagination
    const totalMedications = await Medication.countDocuments({
      patientId: patient._id,
      caretakerId: caretaker._id,
      status: "Active",
    });

    if (medications.length === 0) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No active medications found for this patient",
        result: { medications: [], totalMedications: 0 },
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Active medications fetched successfully",
      result: {
        medications,
        totalMedications,
        currentPage: page,
        totalPages: Math.ceil(totalMedications / limit),
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message:
        error.message + " ERROR in getActiveMedicationsByCaretakerForPatient API",
      result: {},
    });
  }
};

export const getMedicationsByCaretakerForPatient = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate patient belongs to caretaker
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // Step 3: Fetch medications for that patient
    const medications = await Medication.find({
      patientId: patient._id,
    }).sort({ createdAt: -1 });

    if (!medications.length) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No medications found for this patient",
        result: [],
      });
    }

    // Step 4: Return data
    return res.send({
      statusCode: 200,
      success: true,
      message: "Medications fetched successfully",
      result: medications,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in get medications by caretaker API",
      result: {},
    });
  }
};


export const getDiscontinuedMedicationsByCaretakerForPatient = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate patient belongs to caretaker
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // Step 3: Fetch discontinued medications
    const discontinuedMeds = await Medication.find({
      patientId: patient._id,
      status: "Discontinued",
    }).sort({ updatedAt: -1 });

    if (!discontinuedMeds.length) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No discontinued medication history found for this patient",
        result: [],
      });
    }

    // Step 4: Return data
    return res.send({
      statusCode: 200,
      success: true,
      message: "Discontinued medication history fetched successfully",
      result: discontinuedMeds,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in get discontinued medication history API",
      result: {},
    });
  }
};


export const getAllMedicationRemindersByCaretakerForPatient = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;

    // Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // Step 2: Validate patient belongs to caretaker
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // Step 3: Fetch medication reminders for the patient
    const reminders = await MedicationReminder.find({
      patientId: patient._id,
    })
      .populate("medicationId", "medicationName dosage times startingDate reason") // optional populate
      .sort({ createdAt: -1 });

    if (!reminders.length) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No medication reminders found for this patient",
        result: [],
      });
    }

    // Step 4: Return result
    return res.send({
      statusCode: 200,
      success: true,
      message: "Medication reminders fetched successfully",
      result: reminders,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message:
        error.message +
        " Error in get all medication reminders by caretaker for particular patient API",
      result: {},
    });
  }
};

// -------------------- GET BLOOD PRESSURE BY CARETAKER --------------------
// export const getPatientBloodPressureByCaretaker = async (req, res) => {
//   try {
//     const token = req.token; // caretaker token
//     const { patientId } = req.params;

//     // Validate caretaker
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

//     // Validate patient
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

//     const record = await PatientRecord.find({
//       patient_id:patientId,
//     })
//       .select("bloodPressure createdAt")
//       .sort({ createdAt: -1 });
// console.log("Fetched Records:", record);
// console.log("bloodPressure", record.length > 0 ? record[0].bloodPressure : null);
//     if (!record || !record.length || !record[0].bloodPressure) {
//       return res.json({
//         success: true,
//         message: "No blood pressure record found",
//         result: {},
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Blood Pressure fetched successfully",
//       result: record.map((r) => ({
//         ...r.bloodPressure,
//         createdAt: r.createdAt,
//       })),
//     });
//   } catch (err) {
//     console.error("Error in getPatientBloodPressureByCaretaker:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// -------------------- GET BLOOD PRESSURE BY CARETAKER --------------------
export const getPatientBloodPressureByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { filter, week, from, to } = req.query;
    // filter = 'weekly' for last 7 days
    // week = 'YYYY-MM-DD' (specific week start date)
    // from & to = 'YYYY-MM-DD' (custom date range)

    // 🧩 Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker)
      return res.status(401).json({ success: false, message: "Invalid or inactive caretaker" });

    // 🧩 Validate patient
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient)
      return res.status(404).json({ success: false, message: "Patient not found or inactive" });

    // 🧩 Build dynamic date filter
    let dateFilter = {};

    // Case 1: Weekly (last 7 days)
    if (filter === "weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    }

    // Case 2: Specific week (week param)
    else if (week) {
      const startOfWeek = new Date(week);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // include next 6 days
      dateFilter = { createdAt: { $gte: startOfWeek, $lte: endOfWeek } };
    }

    // Case 3: Custom date range
    else if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999); // include full day
      dateFilter = { createdAt: { $gte: fromDate, $lte: toDate } };
    }

    // 🧩 Fetch records
    const record = await PatientRecord.find({
      patient_id: patientId,
      ...dateFilter,
    })
      .select("bloodPressure createdAt")
      .sort({ createdAt: -1 });

    if (!record || !record.length || !record[0].bloodPressure) {
      return res.json({
        success: true,
        message: "No blood pressure record found for given date range",
        result: [],
      });
    }

    return res.json({
      success: true,
      message: "Blood Pressure fetched successfully",
      filterApplied: dateFilter,
      result: record.map((r) => ({
        ...r.bloodPressure,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error in getPatientBloodPressureByCaretaker:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// -------------------- GET BLOOD SUGAR BY CARETAKER --------------------
export const getPatientBloodSugarByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { filter, week, from, to } = req.query;

    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker)
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker",
      });

    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active",
    });
    if (!patient)
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });

    // 🧩 Build dynamic date filter
    let dateFilter = {};
    if (filter === "weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (week) {
      const startOfWeek = new Date(week);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      dateFilter = { createdAt: { $gte: startOfWeek, $lte: endOfWeek } };
    } else if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: fromDate, $lte: toDate } };
    }

    const record = await PatientRecord.find({
      patient_id: patientId,
      ...dateFilter,
    })
      .select("bloodSugar createdAt")
      .sort({ createdAt: -1 });

    if (!record || !record.length || !record[0].bloodSugar)
      return res.json({
        success: true,
        message: "No blood sugar record found for given date range",
        result: [],
      });

    return res.json({
      success: true,
      message: "Blood Sugar fetched successfully",
      result: record.map((r) => ({
        ...r.bloodSugar,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error in getPatientBloodSugarByCaretaker:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// export const getPatientBloodSugarByCaretaker = async (req, res) => {
//   try {
//     const token = req.token;
//     const { patientId } = req.params;

//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active",
//     });
//     if (!caretaker)
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or inactive caretaker",
//       });

//     const patient = await Patient.findOne({
//       _id: patientId,
//       status: "Active",
//     });
//     if (!patient)
//       return res.status(404).json({
//         success: false,
//         message: "Patient not found or inactive",
//       });

//     const record = await PatientRecord.find({
//       patient_id: patientId,
//     })
//       .select("bloodSugar createdAt")
//       .sort({ createdAt: -1 });

//     if (!record || !record.length || !record[0].bloodSugar)
//       return res.json({
//         success: true,
//         message: "No blood sugar record found",
//         result: {},
//       });

//     return res.json({
//       success: true,
//       message: "Blood Sugar fetched successfully",
//       result: record.map((r) => ({
//         ...r.bloodSugar,
//         createdAt: r.createdAt,
//       })),
//     });
//   } catch (err) {
//     console.error("Error in getPatientBloodSugarByCaretaker:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// -------------------- GET BODY TEMPERATURE BY CARETAKER --------------------


export const getPatientBodyTempByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { filter, week, from, to } = req.query;

    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker)
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker",
      });

    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active",
    });
    if (!patient)
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });

    // 🧩 Build dynamic date filter
    let dateFilter = {};
    if (filter === "weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (week) {
      const startOfWeek = new Date(week);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      dateFilter = { createdAt: { $gte: startOfWeek, $lte: endOfWeek } };
    } else if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: fromDate, $lte: toDate } };
    }

    const record = await PatientRecord.find({
      patient_id: patientId,
      ...dateFilter,
    })
      .select("bodyTemp createdAt")
      .sort({ createdAt: -1 });

    if (!record || !record.length || !record[0].bodyTemp)
      return res.json({
        success: true,
        message: "No body temperature record found for given date range",
        result: [],
      });

    return res.json({
      success: true,
      message: "Body Temperature fetched successfully",
      result: record.map((r) => ({
        ...r.bodyTemp,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error in getPatientBodyTempByCaretaker:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// export const getPatientBodyTempByCaretaker = async (req, res) => {
//   try {
//     const token = req.token;
//     const { patientId } = req.params;

//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active",
//     });
//     if (!caretaker)
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or inactive caretaker",
//       });

//     const patient = await Patient.findOne({
//       _id: patientId,
//       status: "Active",
//     });
//     if (!patient)
//       return res.status(404).json({
//         success: false,
//         message: "Patient not found or inactive",
//       });

//     const record = await PatientRecord.find({
//       patient_id: patientId,
//     })
//       .select("bodyTemp createdAt")
//       .sort({ createdAt: -1 });

//     if (!record || !record.length || !record[0].bodyTemp)
//       return res.json({
//         success: true,
//         message: "No body temperature record found",
//         result: {},
//       });

//     return res.json({
//       success: true,
//       message: "Body Temperature fetched successfully",
//       result: record.map((r) => ({
//         ...r.bodyTemp,
//         createdAt: r.createdAt,
//       })),
//     });
//   } catch (err) {
//     console.error("Error in getPatientBodyTempByCaretaker:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// -------------------- GET BODY WEIGHT BY CARETAKER --------------------

export const getPatientBodyWeightByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { filter, week, from, to } = req.query;

    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker)
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker",
      });

    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active",
    });
    if (!patient)
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });

    // 🧩 Build dynamic date filter
    let dateFilter = {};
    if (filter === "weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (week) {
      const startOfWeek = new Date(week);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      dateFilter = { createdAt: { $gte: startOfWeek, $lte: endOfWeek } };
    } else if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: fromDate, $lte: toDate } };
    }

    const record = await PatientRecord.find({
      patient_id: patientId,
      ...dateFilter,
    })
      .select("bodyWeight createdAt")
      .sort({ createdAt: -1 });

    if (!record || !record.length || !record[0].bodyWeight)
      return res.json({
        success: true,
        message: "No body weight record found for given date range",
        result: [],
      });

    return res.json({
      success: true,
      message: "Body Weight fetched successfully",
      result: record.map((r) => ({
        ...r.bodyWeight,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error in getPatientBodyWeightByCaretaker:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// export const getPatientBodyWeightByCaretaker = async (req, res) => {
//   try {
//     const token = req.token;
//     const { patientId } = req.params;

//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active",
//     });
//     if (!caretaker)
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or inactive caretaker",
//       });

//     const patient = await Patient.findOne({
//       _id: patientId,
//       status: "Active",
//     });
//     if (!patient)
//       return res.status(404).json({
//         success: false,
//         message: "Patient not found or inactive",
//       });

//     const record = await PatientRecord.find({
//       patient_id: patientId,
//     })
//       .select("bodyWeight createdAt")
//       .sort({ createdAt: -1 });

//     if (!record || !record.length || !record[0].bodyWeight)
//       return res.json({
//         success: true,
//         message: "No body weight record found",
//         result: {},
//       });

//     return res.json({
//       success: true,
//       message: "Body Weight fetched successfully",
//       result: record.map((r) => ({
//         ...r.bodyWeight,
//         createdAt: r.createdAt,
//       })),
//     });
//   } catch (err) {
//     console.error("Error in getPatientBodyWeightByCaretaker:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

// -------------------- GET HEART RATE BY CARETAKER --------------------

export const getPatientHeartRateByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { filter, week, from, to } = req.query;

    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!caretaker)
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive caretaker",
      });

    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active",
    });
    if (!patient)
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });

    // 🧩 Build dynamic date filter
    let dateFilter = {};
    if (filter === "weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (week) {
      const startOfWeek = new Date(week);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      dateFilter = { createdAt: { $gte: startOfWeek, $lte: endOfWeek } };
    } else if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: fromDate, $lte: toDate } };
    }

    const record = await PatientRecord.find({
      patient_id: patientId,
      ...dateFilter,
    })
      .select("heartRate createdAt")
      .sort({ createdAt: -1 });

    if (!record || !record.length || !record[0].heartRate)
      return res.json({
        success: true,
        message: "No heart rate record found for given date range",
        result: [],
      });

    return res.json({
      success: true,
      message: "Heart Rate fetched successfully",
      result: record.map((r) => ({
        ...r.heartRate,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error in getPatientHeartRateByCaretaker:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// export const getPatientHeartRateByCaretaker = async (req, res) => {
//   try {
//     const token = req.token;
//     const { patientId } = req.params;

//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active",
//     });
//     if (!caretaker)
//       return res.status(401).json({
//         success: false,
//         message: "Invalid or inactive caretaker",
//       });

//     const patient = await Patient.findOne({
//       _id: patientId,
//       status: "Active",
//     });
//     if (!patient)
//       return res.status(404).json({
//         success: false,
//         message: "Patient not found or inactive",
//       });

//     const record = await PatientRecord.find({
//       patient_id: patientId,
//     })
//       .select("heartRate createdAt")
//       .sort({ createdAt: -1 });

//     if (!record || !record.length || !record[0].heartRate)
//       return res.json({
//         success: true,
//         message: "No heart rate record found",
//         result: {},
//       });

//     return res.json({
//       success: true,
//       message: "Heart Rate fetched successfully",
//       result: record.map((r) => ({
//         ...r.heartRate,
//         createdAt: r.createdAt,
//       })),
//     });
//   } catch (err) {
//     console.error("Error in getPatientHeartRateByCaretaker:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// };

export const getPatientMedicalReportByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;

    // Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: "Caretaker not found or inactive",
      });
    }

    // Validate patient
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // Fetch reports
    const reports = await MedicalReport.find({ patientId }).sort({ createdAt: -1 });

    if (!reports.length) {
      return res.json({
        success: true,
        message: "No medical reports found",
        result: [],
      });
    }

    return res.json({
      success: true,
      message: "Medical reports fetched successfully",
      result: reports,
    });
  } catch (err) {
    console.error("Error in getPatientMedicalReportByCaretaker:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// -------------------- GET PRESCRIPTION BY CARETAKER --------------------
export const getPatientPrescriptionByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;

    // Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: "Caretaker not found or inactive",
      });
    }

    // Validate patient
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // Fetch prescriptions
    const prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });

    if (!prescriptions.length) {
      return res.json({
        success: true,
        message: "No prescriptions found",
        result: [],
      });
    }

    return res.json({
      success: true,
      message: "Prescriptions fetched successfully",
      result: prescriptions,
    });
  } catch (err) {
    console.error("Error in getPatientPrescriptionByCaretaker:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const getDateRange = (date = new Date()) => {
  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(date.setHours(23, 59, 59, 999));
  return { start, end };
};

export const addPatientBloodPressureByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { day, amBP, pmBP, comments } = req.body;
    const { patientId } = req.params;

    // --- Caretaker Validation ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Patient Validation ---
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "patientId required",
        result: {},
      });
    }

    if (!day || !amBP || !pmBP) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "day, amBP and pmBP are required",
        result: {},
      });
    }

    const { start, end } = getDateRange(new Date());
    let record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      record.bloodPressure = { day, amBP, pmBP, comments };
      await record.save();
    } else {
      record = await PatientRecord.create({
        patient_id: patientId,
        bloodPressure: { day, amBP, pmBP, comments },
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Blood Pressure added/updated successfully",
      result: record,
    });
  } catch (err) {
    return res.send({
      statusCode: 500,
      success: false,
      message: err.message + " ERROR in addPatientBloodPressureByCaretaker API",
      result: {},
    });
  }
};


export const addPatientBloodSugarByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { day, before, after, insulinDose, notes } = req.body;
    const { patientId } = req.params;

    // --- Caretaker Validation ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Patient Validation ---
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "patientId required",
        result: {},
      });
    }

    if (!day || !before || !after) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "day, before and after sugar values are required",
        result: {},
      });
    }

    const { start, end } = getDateRange(new Date());
    let record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      record.bloodSugar = { day, before, after, insulinDose, notes };
      await record.save();
    } else {
      record = await PatientRecord.create({
        patient_id: patientId,
        bloodSugar: { day, before, after, insulinDose, notes },
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Blood Sugar added/updated successfully",
      result: record,
    });
  } catch (err) {
    return res.send({
      statusCode: 500,
      success: false,
      message: err.message + " ERROR in addPatientBloodSugarByCaretaker API",
      result: {},
    });
  }
};

export const addPatientBodyWeightByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { day, weight } = req.body;
    const { patientId } = req.params;

    // --- Caretaker Validation ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Patient Validation ---
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "patientId required",
        result: {},
      });
    }

    if (!day || !weight) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "day and weight are required",
        result: {},
      });
    }

    const { start, end } = getDateRange(new Date());
    let record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      record.bodyWeight = { day, weight };
      await record.save();
    } else {
      record = await PatientRecord.create({
        patient_id: patientId,
        bodyWeight: { day, weight },
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Body Weight added/updated successfully",
      result: record,
    });
  } catch (err) {
    return res.send({
      statusCode: 500,
      success: false,
      message: err.message + " ERROR in addPatientBodyWeightByCaretaker API",
      result: {},
    });
  }
};

export const addPatientHeartRateByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { day, time, amRate, pmRate, notes } = req.body;
    const { patientId } = req.params;

    // --- Caretaker Validation ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Patient Validation ---
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "patientId required",
        result: {},
      });
    }

    if (!day) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "day is required",
        result: {},
      });
    }

    const { start, end } = getDateRange(new Date());
    let record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      record.heartRate = { day, time, amRate, pmRate, notes };
      await record.save();
    } else {
      record = await PatientRecord.create({
        patient_id: patientId,
        heartRate: { day, time, amRate, pmRate, notes },
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Heart Rate added/updated successfully",
      result: record,
    });
  } catch (err) {
    return res.send({
      statusCode: 500,
      success: false,
      message: err.message + " ERROR in addPatientHeartRateByCaretaker API",
      result: {},
    });
  }
};

export const addPatientBodyTempByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { day, time, amTemp, pmTemp, notes, insulinDose } = req.body;
    const { patientId } = req.params
    // --- Caretaker Validation ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Patient Validation ---
    const patient = await Patient.findOne({
      _id: patientId,
      // caretakerId: caretaker._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "patientId required",
        result: {},
      });
    }

    if (!day) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "day is required",
        result: {},
      });
    }

    const { start, end } = getDateRange(new Date());

    let record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (record) {
      record.bodyTemp = { day, time, amTemp, pmTemp, notes, insulinDose };
      await record.save();
    } else {
      record = await PatientRecord.create({
        patient_id: patientId,
        bodyTemp: { day, time, amTemp, pmTemp, notes, insulinDose },
      });
      await record.save();
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Body Temperature added/updated successfully",
      result: record,
    });

  } catch (err) {
    return res.send({
      statusCode: 500,
      success: false,
      message: err.message + " ERROR in addPatientBodyTempByCaretaker API",
      result: {},
    });
  }
};

export const addPrescriptionByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patient_id, doctorName, date, medications, instructions } = req.body;

    // --- Caretaker Validation ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Patient Validation ---
    const patient = await Patient.findOne({
      _id: patient_id,
      caretakerId: caretaker._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // --- Field Validations ---
    if (!patient_id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "patient_id is required",
        result: {},
      });
    }

    if (!doctorName?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Doctor name is required",
        result: {},
      });
    }

    if (!date) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Date is required",
        result: {},
      });
    }

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "At least one medication is required",
        result: {},
      });
    }

    if (!instructions?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Instructions are required",
        result: {},
      });
    }

    // --- Create Prescription ---
    const newPrescription = new Prescription({
      patientId: patient._id,
      caretakerId: caretaker._id,
      doctorName: doctorName.trim(),
      date,
      medications,
      instructions: instructions.trim(),
      status: "Active",
    });

    await newPrescription.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Prescription added successfully for the patient",
      result: newPrescription,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in addPrescriptionByCaretaker API",
      result: {},
    });
  }
};
export const uploadMedicalReportByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patient_id, description } = req.body;

    // --- Caretaker Validation ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Patient Validation ---
    const patient = await Patient.findOne({
      _id: patient_id,
      caretakerId: caretaker._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // --- Files Validation ---
    if (!req.files || req.files.length === 0) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "At least one file is required",
        result: {},
      });
    }

    let savedReports = [];

    // --- File Processing ---
    for (let file of req.files) {
      let fileType = "";
      if (file.mimetype === "application/pdf") fileType = "PDF";
      else if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") fileType = "JPG";
      else if (file.mimetype === "image/png") fileType = "PNG";
      else continue; // agar type allowed nahi hai to skip kar

      const report = new MedicalReport({
        patient_id: patient._id,
        caretaker_id: caretaker._id,
        fileUrl: file.path, // multer path / cloud path
        fileType,
        description,
        status: "Active",
      });

      await report.save();
      savedReports.push(report);
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Medical reports uploaded successfully by caretaker",
      result: savedReports,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in uploadMedicalReportByCaretaker API",
      result: {},
    });
  }
};

export const addReminderByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patient_id, title, description, date, time, type } = req.body;

    // --- Caretaker Validation ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Patient Validation ---
    const patient = await Patient.findOne({
      _id: patient_id,
      caretakerId: caretaker._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // --- Input Validations ---
    if (!title?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Title is required",
        result: {},
      });
    }

    if (!description?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Description is required",
        result: {},
      });
    }

    if (!date) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Date is required",
        result: {},
      });
    }

    if (!time) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Time is required",
        result: {},
      });
    }

    if (!type?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Reminder type is required",
        result: {},
      });
    }

    // --- Create Reminder ---
    const newReminder = new Reminder({
      patient_id: patient._id,
      caretaker_id: caretaker._id,
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      type: type.trim(),
      status: "Active",
    });

    await newReminder.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Reminder added successfully for the patient",
      result: newReminder,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in addReminderByCaretaker API",
      result: {},
    });
  }
};

export const addPatientDietByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params;
    const { dietType, calories, notes, startDate, endDate } = req.body;

    // --- Validation ---
    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient ID is required in params",
        result: {},
      });
    }

    if (!dietType?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Diet type is required",
        result: {},
      });
    }

    if (!calories) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Calories count is required",
        result: {},
      });
    }

    if (!startDate) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Start date is required",
        result: {},
      });
    }

    // --- Step 1: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Step 2: Validate Patient belongs to Caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // --- Step 3: Create Diet Record ---
    const newDiet = new PatientDiet({
      caretakerId: caretaker._id,
      patientId: patient._id,
      dietType: dietType.trim(),
      calories,
      notes,
      startDate,
      endDate,
      status: "Active",
    });

    await newDiet.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient diet added successfully",
      result: newDiet,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in addPatientDietByCaretaker API",
      result: {},
    });
  }
};

export const addPatientMealByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params;
    const { mealType, foodItems, calories, time } = req.body;

    // --- Validation ---
    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient ID is required in params",
        result: {},
      });
    }

    if (!mealType?.trim()) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Meal type is required",
        result: {},
      });
    }

    if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "At least one food item is required",
        result: {},
      });
    }

    if (!time) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Meal time is required",
        result: {},
      });
    }

    // --- Step 1: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid or inactive caretaker token",
        result: {},
      });
    }

    // --- Step 2: Validate Patient belongs to Caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // --- Step 3: Create Meal Record ---
    const newMeal = new PatientMeal({
      caretakerId: caretaker._id,
      patientId: patient._id,
      mealType: mealType.trim(),
      foodItems,
      calories,
      time,
      status: "Active",
    });

    await newMeal.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient meal added successfully",
      result: newMeal,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in addPatientMealByCaretaker API",
      result: {},
    });
  }
};

export const getTermsAndConditionsByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token

    // Step 1: Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName mobileNumber status");
    console.log("Caretaker:", caretaker);

    if (!caretaker) {
      return res.status(401).json({
        status: false,
        message: "Invalid caretaker or inactive status.",
      });
    }

    // Step 2: Fetch Terms & Conditions
    const terms = await TermsAndConditions.findOne().select("content updatedAt");
    if (!terms) {
      return res.status(404).json({
        status: false,
        message: "Terms & Conditions not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Terms & Conditions fetched successfully.",
      data: terms,
    });
  } catch (error) {
    console.error("Error in getTermsAndConditionsByCaretaker:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};



// 🔒 Get Privacy Policy by Caretaker
export const getPrivacyPolicyByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token

    // Step 1: Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName mobileNumber status");

    if (!caretaker) {
      return res.status(401).json({
        status: false,
        message: "Invalid caretaker or inactive status.",
      });
    }

    // Step 2: Fetch Privacy Policy
    const policy = await PrivacyPolicy.findOne().select("content updatedAt");
    if (!policy) {
      return res.status(404).json({
        status: false,
        message: "Privacy Policy not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Privacy Policy fetched successfully.",
      data: policy,
    });
  } catch (error) {
    console.error("Error in getPrivacyPolicyByCaretaker:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};



// ❓ Get FAQ by Caretaker
export const getFaqByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token

    // Step 1: Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName mobileNumber status");

    if (!caretaker) {
      return res.status(401).json({
        status: false,
        message: "Invalid caretaker or inactive status.",
      });
    }

    // Step 2: Fetch all FAQs
    const faqs = await FAQ.find().select("question answer updatedAt");
    if (!faqs.length) {
      return res.status(404).json({
        status: false,
        message: "No FAQs found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "FAQs fetched successfully.",
      data: faqs,
    });
  } catch (error) {
    console.error("Error in getFaqByCaretaker:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
import fs from "fs";
import path from "path";
import { hostname } from "os";

export const editCaretakerProfile = async (req, res) => {
  try {
    const token = req.token;
    let { fullName, email, certification, mobileNumber, gender, age } = req.body;

    fullName = fullName?.trim();
    email = email?.trim()?.toLowerCase();

    // --- Validations ---
    if (!fullName) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Full name is required",
        result: {},
      });
    }

    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Email is required",
        result: {},
      });
    }

    // --- Step 1: Find Caretaker ---
    const caretaker = await Caretaker.findById(token._id);
    if (!caretaker) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found",
        result: {},
      });
    }

    // --- Step 2: Handle Profile Photo Upload (if any) ---
    let profilePhotoUrl = caretaker.profilePhoto; // keep old one if not updated

    if (req.file) {
      // Delete old photo if exists
      if (caretaker.profilePhoto) {
        const oldPath = path.join(
          "uploads/profilePhotos",
          path.basename(caretaker.profilePhoto)
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Build absolute URL for new photo
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      profilePhotoUrl = `${baseUrl}/uploads/${req.file.filename}`;
      // If using profilePhotos folder:
      // profilePhotoUrl = `${baseUrl}/uploads/profilePhotos/${req.file.filename}`;
    }

    // --- Step 3: Update Caretaker Info ---
    caretaker.fullName = fullName;
    caretaker.email = email;
    caretaker.profilePhoto = profilePhotoUrl;
    caretaker.certification = certification;
    caretaker.mobileNumber = mobileNumber;
    caretaker.gender = gender;
    caretaker.age = age;

    await caretaker.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Caretaker profile updated successfully",
      result: caretaker,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in editCaretakerProfile API",
      result: {},
    });
  }
};

export const getMedicalHistoryByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params;

    // --- Step 1: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName status");

    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid caretaker or inactive status.",
        result: {},
      });
    }

    // --- Step 2: Check if Patient exists and is assigned to this Caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      // caretakerId: caretaker._id, // ensure patient belongs to caretaker
      status: "Active",
    }).select("_id fullName status");

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker.",
        result: {},
      });
    }

    // --- Step 3: Fetch Medical History for the Patient ---
    const history = await MedicalHistory.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    if (!history || history.length === 0) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No medical history found for this patient.",
        result: [],
      });
    }

    // --- Step 4: Return Data ---
    return res.send({
      statusCode: 200,
      success: true,
      message: "Medical history fetched successfully.",
      result: history,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getMedicalHistoryByCaretaker API",
      result: {},
    });
  }
};

export const getPatientMealByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params;

    // --- Step 1: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName status");

    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid caretaker or inactive status.",
        result: {},
      });
    }

    // --- Step 2: Validate Patient belongs to Caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
      status: "Active",
    }).select("_id fullName status");

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker.",
        result: {},
      });
    }

    // --- Step 3: Fetch Meal Records ---
    const meals = await Meal.find({ patientId }).sort({ createdAt: -1 }).lean();

    if (!meals || meals.length === 0) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No meal records found for this patient.",
        result: [],
      });
    }

    // --- Step 4: Return Response ---
    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient meal records fetched successfully.",
      result: meals,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getPatientMealByCaretaker API",
      result: {},
    });
  }
};


export const getPatientDietByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params;

    // --- Step 1: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName status");

    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid caretaker or inactive status.",
        result: {},
      });
    }

    // --- Step 2: Validate Patient belongs to Caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
      status: "Active",
    }).select("_id fullName status");

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker.",
        result: {},
      });
    }

    // --- Step 3: Fetch Diet Plan ---
    const diet = await Diet.find({ patientId }).sort({ createdAt: -1 }).lean();

    if (!diet || diet.length === 0) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No diet plan found for this patient.",
        result: [],
      });
    }

    // --- Step 4: Return Response ---
    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient diet plan fetched successfully.",
      result: diet,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getPatientDietByCaretaker API",
      result: {},
    });
  }
};

export const getPatientDailyRoutineByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { patientId } = req.params;

    // --- Step 1: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName status");

    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid caretaker or inactive status.",
        result: {},
      });
    }

    // --- Step 2: Validate Patient belongs to Caretaker ---
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
      status: "Active",
    }).select("_id fullName status");

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker.",
        result: {},
      });
    }

    // --- Step 3: Fetch Daily Routine Records ---
    const routines = await DailyRoutine.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    if (!routines || routines.length === 0) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "No daily routine found for this patient.",
        result: [],
      });
    }

    // --- Step 4: Return Response ---
    return res.send({
      statusCode: 200,
      success: true,
      message: "Daily routine fetched successfully.",
      result: routines,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getPatientDailyRoutineByCaretaker API",
      result: {},
    });
  }
};


export const getAppLanguageByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token

    // --- Step 1: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName language status");

    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid caretaker or inactive status.",
        result: {},
      });
    }

    // --- Step 2: Check if language exists ---
    if (!caretaker.language) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "App language not set for this caretaker.",
        result: {},
      });
    }

    // --- Step 3: Return response ---
    return res.send({
      statusCode: 200,
      success: true,
      message: "App language fetched successfully.",
      result: { language: caretaker.language },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getAppLanguageByCaretaker API",
      result: {},
    });
  }
};


export const changeAppLanguageByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { language } = req.body;

    // --- Step 1: Validate Input ---
    if (!language) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Language is required.",
        result: {},
      });
    }

    // --- Step 2: Validate Caretaker ---
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    }).select("_id fullName language status");

    if (!caretaker) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid caretaker or inactive status.",
        result: {},
      });
    }

    // --- Step 3: Update Language ---
    caretaker.language = language;
    await caretaker.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "App language updated successfully.",
      result: { language: caretaker.language },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in changeAppLanguageByCaretaker API",
      result: {},
    });
  }
};

export const addPatientCareNotesByCaretaker = async (req, res) => {
  try {
    const token = req.token; // Caretaker token
    const { patientId } = req.params; // patient ID from params
    const { title, noteType, description, date } = req.body;

    // 🧩 Step 1: Validate caretaker token
    if (!token || !token._id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Caretaker token required",
        result: {},
      });
    }

    // 🧩 Step 2: Verify caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // 🧩 Step 3: Verify patient assigned to caretaker
    const patient = await Patient.findOne({
      _id: patientId,
      caretakerId: caretaker._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or not assigned to this caretaker",
        result: {},
      });
    }

    // 🧩 Step 4: Create Care Note
    const newCareNote = await CareNote.create({
      patientId: patient._id,
      caretakerId: caretaker._id,
      title: title?.trim() || "",
      noteType: noteType || "other",
      description: description?.trim() || "",
      date: date || new Date(),
      status: "Active",
    });

    // 🧩 Step 5: Response
    return res.send({
      statusCode: 200,
      success: true,
      message: "Care note added successfully",
      result: newCareNote,
    });
  } catch (error) {
    console.error("❌ Error in addPatientCareNotesByCaretaker:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in addPatientCareNotesByCaretaker API",
      result: {},
    });
  }
};

export const getCareNotesByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.query; // optional

    // 🧩 Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!caretaker) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // 🧩 Step 2: Build filter for CareNotes
    const filter = {
      caretakerId: caretaker._id,
      status: "Active",
    };

    if (patientId) {
      filter.patientId = patientId;
    }

    // 🧩 Step 3: Fetch notes
    const careNotes = await CareNote.find(filter)
      .populate("patientId", "fullName age gender profilePhoto condition")
      .select("_id caretakerId patientId note date status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    if (!careNotes.length) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No care notes found",
        result: [],
      });
    }

    // 🧩 Step 4: Structure response
    const result = careNotes.map((note) => ({
      note_id: note._id,
      date: note.date || note.createdAt,
      note: note.note,
      patient: note.patientId
        ? {
          patient_id: note.patientId._id,
          name: note.patientId.fullName,
          age: note.patientId.age,
          gender: note.patientId.gender,
          profilePhoto: note.patientId.profilePhoto || null,
          condition: note.patientId.condition || "Not specified",
        }
        : null,
    }));

    // 🧩 Step 5: Send response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Care notes fetched successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getCareNotesByCaretaker API",
      result: {},
    });
  }
};


export const editPatientBloodPressureByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { day, amBP, pmBP, comments } = req.body;

    // 🧩 Step 1: Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res
        .status(401)
        .json({
          statusCode: 401,
          success: false,
          message: "Invalid caretaker token",
          result: {},
        });
    }

    // 🧩 Step 2: Check patient assignment
    // const isAssigned = caretaker.patients.some(p => p.toString() === patientId);
    // if (!isAssigned) {
    //   return res
    //     .status(403)
    //     .json({
    //       statusCode: 403,
    //       success: false,
    //       message: "This patient is not assigned to you",
    //       result: {},
    //     });
    // }

    // 🧩 Step 3: Validate body
    if (!day && !amBP && !pmBP && !comments) {
      return res
        .status(400)
        .json({
          statusCode: 400,
          success: false,
          message: "At least one field is required to update (day, amBP, pmBP, comments)",
          result: {},
        });
    }

    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res
        .status(404)
        .json({
          statusCode: 404,
          success: false,
          message: "No patient record found for today",
          result: {},
        });
    }

    record.bloodPressure = {
      ...record.bloodPressure?.toObject?.() || record.bloodPressure || {},
      ...(day && { day }),
      ...(amBP && { amBP }),
      ...(pmBP && { pmBP }),
      ...(comments && { comments }),
    };

    await record.save();

    return res
      .status(200)
      .json({
        statusCode: 200,
        success: true,
        message: "Blood Pressure updated successfully",
        result: record.bloodPressure,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        statusCode: 500,
        success: false,
        message: error.message,
        result: {},
      });
  }
};
export const editPatientBodyTempByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { day, time, amTemp, pmTemp, notes } = req.body;

    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res
        .status(401)
        .json({
          statusCode: 401,
          success: false,
          message: "Invalid caretaker token",
          result: {},
        });
    }

    // const isAssigned = caretaker.patients.some(p => p.toString() === patientId);
    // if (!isAssigned) {
    //   return res
    //     .status(403)
    //     .json({
    //       statusCode: 403,
    //       success: false,
    //       message: "This patient is not assigned to you",
    //       result: {},
    //     });
    // }

    if (!day && !time && !amTemp && !pmTemp && !notes) {
      return res
        .status(400)
        .json({
          statusCode: 400,
          success: false,
          message: "At least one field is required to update (day, time, amTemp, pmTemp, notes)",
          result: {},
        });
    }

    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res
        .status(404)
        .json({
          statusCode: 404,
          success: false,
          message: "No patient record found for today",
          result: {},
        });
    }

    record.bodyTemp = {
      ...record.bodyTemp?.toObject?.() || record.bodyTemp || {},
      ...(day && { day }),
      ...(time && { time }),
      ...(amTemp && { amTemp }),
      ...(pmTemp && { pmTemp }),
      ...(notes && { notes }),
    };

    await record.save();

    return res
      .status(200)
      .json({
        statusCode: 200,
        success: true,
        message: "Body Temperature updated successfully",
        result: record.bodyTemp,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        statusCode: 500,
        success: false,
        message: error.message,
        result: {},
      });
  }
};
export const editPatientHeartRateByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { day, time, amRate, pmRate, notes } = req.body;

    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res
        .status(401)
        .json({
          statusCode: 401,
          success: false,
          message: "Invalid caretaker token",
          result: {},
        });
    }

    // const isAssigned = caretaker.patients.some(p => p.toString() === patientId);
    // if (!isAssigned) {
    //   return res
    //     .status(403)
    //     .json({
    //       statusCode: 403,
    //       success: false,
    //       message: "This patient is not assigned to you",
    //       result: {},
    //     });
    // }

    if (!day && !time && !amRate && !pmRate && !notes) {
      return res
        .status(400)
        .json({
          statusCode: 400,
          success: false,
          message: "At least one field is required to update (day, time, amRate, pmRate, notes)",
          result: {},
        });
    }

    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res
        .status(404)
        .json({
          statusCode: 404,
          success: false,
          message: "No patient record found for today",
          result: {},
        });
    }

    record.heartRate = {
      ...record.heartRate?.toObject?.() || record.heartRate || {},
      ...(day && { day }),
      ...(time && { time }),
      ...(amRate && { amRate }),
      ...(pmRate && { pmRate }),
      ...(notes && { notes }),
    };

    await record.save();

    return res
      .status(200)
      .json({
        statusCode: 200,
        success: true,
        message: "Heart Rate updated successfully",
        result: record.heartRate,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        statusCode: 500,
        success: false,
        message: error.message,
        result: {},
      });
  }
};
export const editPatientBodyWeightByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { day, weight } = req.body;

    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res
        .status(401)
        .json({
          statusCode: 401,
          success: false,
          message: "Invalid caretaker token",
          result: {},
        });
    }

    // const isAssigned = caretaker.patients.some(p => p.toString() === patientId);
    // if (!isAssigned) {
    //   return res
    //     .status(403)
    //     .json({
    //       statusCode: 403,
    //       success: false,
    //       message: "This patient is not assigned to you",
    //       result: {},
    //     });
    // }

    if (!day && !weight) {
      return res
        .status(400)
        .json({
          statusCode: 400,
          success: false,
          message: "At least one field is required to update (day or weight)",
          result: {},
        });
    }

    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res
        .status(404)
        .json({
          statusCode: 404,
          success: false,
          message: "No patient record found for today",
          result: {},
        });
    }

    record.bodyWeight = {
      ...record.bodyWeight?.toObject?.() || record.bodyWeight || {},
      ...(day && { day }),
      ...(weight && { weight }),
    };

    await record.save();

    return res
      .status(200)
      .json({
        statusCode: 200,
        success: true,
        message: "Body Weight updated successfully",
        result: record.bodyWeight,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        statusCode: 500,
        success: false,
        message: error.message,
        result: {},
      });
  }
};
export const editPatientBloodSugarByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { patientId } = req.params;
    const { day, fasting, afterMeal, comments } = req.body;

    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res
        .status(401)
        .json({
          statusCode: 401,
          success: false,
          message: "Invalid caretaker token",
          result: {},
        });
    }

    const isAssigned = caretaker.patients.some(p => p.toString() === patientId);
    if (!isAssigned) {
      return res
        .status(403)
        .json({
          statusCode: 403,
          success: false,
          message: "This patient is not assigned to you",
          result: {},
        });
    }

    if (!day && !fasting && !afterMeal && !comments) {
      return res
        .status(400)
        .json({
          statusCode: 400,
          success: false,
          message: "At least one field is required to update (day, fasting, afterMeal, comments)",
          result: {},
        });
    }

    const { start, end } = getDateRange(new Date());
    const record = await PatientRecord.findOne({
      patient_id: patientId,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      return res
        .status(404)
        .json({
          statusCode: 404,
          success: false,
          message: "No patient record found for today",
          result: {},
        });
    }

    record.bloodSugar = {
      ...record.bloodSugar?.toObject?.() || record.bloodSugar || {},
      ...(day && { day }),
      ...(fasting && { fasting }),
      ...(afterMeal && { afterMeal }),
      ...(comments && { comments }),
    };

    await record.save();

    return res
      .status(200)
      .json({
        statusCode: 200,
        success: true,
        message: "Blood Sugar updated successfully",
        result: record.bloodSugar,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        statusCode: 500,
        success: false,
        message: error.message,
        result: {},
      });
  }
};

export const getAllCareNotesByCaretaker = async (req, res) => {
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

    // 🧩 Step 3: Fetch all CareNotes of caretaker’s patients
    const careNotes = await CareNote.find({
      patientId: { $in: caretaker.patients },
      status: "Active",
      $or: [{ guardianId: { $exists: false } }, { guardianId: null }],

    })
      .populate("patientId", "fullName") // ✅ bring patient name
      .sort({ createdAt: -1 })
      .select("-__v");

    if (!careNotes.length) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "No care notes found for your patients",
        result: [],
      });
    }

    // 🧩 Step 4: Format response (optional clean output)
    const formattedNotes = careNotes.map((note) => ({
      _id: note._id,
      patientId: note.patientId?._id,
      patientName: note.patientId?.fullName || "Unknown",
      title: note.title,
      description: note.description,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      status: note.status,
    }));

    // 🧩 Step 5: Send response
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "All care notes fetched successfully",
      result: formattedNotes,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message:
        error.message + " ERROR in getAllCareNotesByCaretaker controller",
      result: {},
    });
  }
};

export const deleteCaretakerByAdmin = async (req, res) => {
  try {
    const token = req.token;
    const { caretakerId } = req.params;

    // Validate Admin
    const adminUser = await Admin.findById(token._id);
    if (!adminUser || adminUser.status !== "Active") {
      return res.status(403).send({
        statusCode: 403,
        success: false,
        message: "Access denied: Admins only",
      });
    }

    // Update caretaker status → Delete
    const updatedCaretaker = await Caretaker.findByIdAndUpdate(
      caretakerId,
      { status: "Delete" },
      { new: true }
    );

    if (!updatedCaretaker) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found",
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Caretaker deleted successfully (status updated)",
      result: updatedCaretaker,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};
