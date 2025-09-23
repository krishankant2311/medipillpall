import Patient from "../models/patientModel.js";
import Admin from "../models/adminModel.js";
import {genrateOTP} from "../../helpers/generateOtp.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../helpers/jwt.js";

// export const addPatient = async (req, res) => {
//   try {
//     let { fullName, age, mobileNumber, password, gender } = req.body;

//     fullName = fullName?.trim()?.toLowerCase();
//     mobileNumber = mobileNumber?.trim();

//     if (!fullName) {
//       return res.send({
//         statusCode: 404,
//         success: false,
//         message: "Required fullName",
//         result: {},
//       });
//     }
//     if (!mobileNumber) {
//       return res.send({
//         statusCode: 404,
//         success: false,
//         message: "Required mobileNumber",
//         result: {},
//       });
//     }
//     if (!age) {
//       return res.send({
//         statusCode: 404,
//         success: false,
//         message: "Required age",
//         result: {},
//       });
//     }
//     if (!password) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Required password",
//         result: {},
//       });
//     }
//     const patientExist = await Patient.findOne({ mobileNumber });
//     if (patientExist) {
//       return res.send({
//         statusCode: 400,
//         success: false,
//         message: "Patient already exist",
//         result: {},
//       });
//     }

//     // Generate tokens
//     // const accessToken = generateAccessToken({_id: patient._id,mobileNumber });
//     // const refreshToken = generateRefreshToken({_id: patient._id, mobileNumber });
//     const ene_password = await bcrypt.hashSync(password, 10);
//     const newPatient = new Patient({
//       fullName,
//       age,
//       mobileNumber,
//       gender,
//       accessToken,
//       refreshToken,
//       password: ene_password,
//     });

//      const accessToken = generateAccessToken({ _id: newPatient._id, mobileNumber });
//     const refreshToken = generateRefreshToken({ _id: newPatient._id, mobileNumber });

//     await newPatient.save();

//     return res.status(200).json({
//       statusCode: 200,
//       success: true,
//       message: "Patient added successfully",
//       result: newPatient,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const addPatient = async (req, res) => {
  try {
    let { fullName, age, mobileNumber, password, gender } = req.body;

    fullName = fullName?.trim()?.toLowerCase();
    mobileNumber = mobileNumber?.trim();

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
    if (!age) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Required age",
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

    const patientExist = await Patient.findOne({ mobileNumber });
    if (patientExist) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient already exist",
        result: {},
      });
    }

    const enc_password = bcrypt.hashSync(password, 10);

    // Step 1: Patient create karo (abhi save nahi karna)
    const newPatient = new Patient({
      fullName,
      age,
      mobileNumber,
      gender,
      password: enc_password,
    });

    // Step 2: Patient ki id se token generate karo
    const accessToken = generateAccessToken({ _id: newPatient._id, mobileNumber });
    const refreshToken = generateRefreshToken({ _id: newPatient._id, mobileNumber });

    // Step 3: Tokens ko assign karo
    newPatient.accessToken = accessToken;
    newPatient.refreshToken = refreshToken;

    // Step 4: Save to DB
    await newPatient.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Patient added successfully",
      result: newPatient,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    let { mobileNumber, password } = req.body;
    mobileNumber = mobileNumber?.trim();
    password = password?.trim();

    if (!mobileNumber) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "mobileNumber required",
        result: {},
      });
    }
     if (!password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "password required",
        result: {},
      });
    }
    // if (!isStrongPassword(password)) {
    //   return res.send({
    //     statusCode: 404,
    //     success: false,
    //     message: "please enter a strong password",
    //     result: {},
    //   });
    // }

    const patient = await Patient.findOne({ mobileNumber });
    if (!patient) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "patient not found",
        result: {},
      });
    }
    if (patient.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: " user has been deleted",
        result: {},
      });
    }
    // if (patient.status === "Pending") {
    //   return res.send({
    //     statusCode: 400,
    //     success: false,
    //     message: "Please verify OTP",
    //     result: {},
    //   });
    // }
    // if (user.status === "Block") {
    //   return res.send({
    //     statusCode: 400,
    //     success: false,
    //     message: "user has been blocked",
    //     result: {},
    //   });
    // }

    const dec_password = await bcrypt.compare(password, patient.password);

    if (!dec_password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "password mismatch",
        result: {},
      });
    }
    const _id = patient._id;
    const token = await generateAccessToken({
      _id: patient._id,
      mobileNumber: patient.mobileNumber,
    });

    patient.token = token;

    await patient.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Login successfully",
      result: {
        _id,
        token,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + "Error in patient login API",
      result: {},
    });
  }
};

export const editPatient = async (req, res) => {
  try {
    const token = req.token;
    const { fullName, age, mobileNumber, gender } = req.body;

    const patient = await Patient.findOne({
      _id: token._id,
      status: "Active",
    });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "patient not found",
        result: {},
      });
    }
    patient.fullName = fullName;
    patient.mobileNumber = mobileNumber;
    patient.age = age;
    patient.gender = gender;

    patient.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient details edit successfully",
      result: {},
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in edit patient details api",
      result: {},
    });
  }
};

export const logoutPatient = async (req, res) => {
  try {
    const accessToken = req.token;

    const patient = await Patient.findOne({ mobileNumber });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }
    if (patient.status == "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient has been deleted",
        result: {},
      });
    }
    if (patient.accessToken == "") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "unauthorise access",
        result: {},
      });
    }

    patient.accessToken = "";

    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient logout successfully",
      result: {},
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in logout patient api",
      result: {},
    });
  }
};


export const deletePatient = async (req, res) => {
  try {
    let token = req.token;
    let _id = token._id;

    if (!_id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient id required",
        result: {},
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      _id,
      { $set: { status: "Delete", deletedAt: Date.now() } },
      { new: true }
    );

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Patient deleted successfully (soft delete)",
      result: patient,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in delete patient API",
      result: {},
    });
  }
};

export const sendOTPbyNumber = async (req, res) => {
  try {
    let { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "mobileNumber required",
        result: {},
      });
    }

    const patient = await Patient.findOne({ number: number });
    if (patient) {
      if (patient.status === "Delete") {
        return res.send({
          statusCode: 200,
          message: "patient has been deleted",
          success: true,
          result: {},
        });
      }
      if (patient.status === "Pending") {
        const { otpValue, otpExpiry } = genrateOTP();

        user.otp = {
          otpValue: otpValue,
          otpExpiry: otpExpiry,
        };
        return res.send({
          statusCode: 200,
          message: "OTP send successfuly on your mobile number",
          success: true,
          result: { otpValue },
        });
      }
    //   if (patient.status === "Block") {
    //     return res.send({
    //       statusCode: 400,
    //       success: false,
    //       message: "Blocked user",
    //       result: {},
    //     });
    //   }
      const { otpValue, otpExpiry } = generateOTP();

      patient.otp = {
        otpValue: otpValue,
        otpExpiry: otpExpiry,
      };
      return res.send({
        statusCode: 200,
        message: "OTP send successfuly on your mobile number",
        success: true,
        result: { otpValue },
      });
    }
    return res.send({
      statusCode: 404,
      success: false,
      message: "user not found",
      result: {},
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + "ERROR in send otp by number",
      result: {},
    });
  }
};

// import Patient from "../models/patientModel.js";
// import { generateOTP } from "../utils/otpGenerator.js";

export const resendOTPbyNumber = async (req, res) => {
  try {
    let { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "mobileNumber required",
        result: {},
      });
    }

    const patient = await Patient.findOne({ number: mobileNumber });

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      });
    }

    if (patient.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient has been deleted",
        result: {},
      });
    }

    if (patient.status === "Block") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient is blocked",
        result: {},
      });
    }

    // Check last OTP time
    const now = Date.now();
    if (patient.otp && patient.otp.lastSentAt) {
      const diffInSeconds = Math.floor((now - patient.otp.lastSentAt) / 1000);
      if (diffInSeconds < 30) {
        return res.send({
          statusCode: 429, // Too Many Requests
          success: false,
          message: `Please wait ${30 - diffInSeconds} seconds before resending OTP`,
          result: {},
        });
      }
    }

    // Generate new OTP
    const { otpValue, otpExpiry } = genrateOTP();

    patient.otp = {
      otpValue: otpValue,
      otpExpiry: otpExpiry,
      lastSentAt: now, // new field for tracking resend timing
    };
    await patient.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "OTP resent successfully on your mobile number",
      result: { otpValue }, // ⚠️ Testing ke liye hi bhej rahe, prod me hata dena
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in resend otp by number",
      result: {},
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email?.trim();
    password = password?.trim();

    if (!email) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Email required",
        result: {},
      });
    }
    if (!password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Password required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ email:email });
    console.log("admin",admin);
    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    if (admin.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Admin account has been deleted",
        result: {},
      });
    }

    const dec_password = await bcrypt.compare(password, admin.password);
    console.log("dec_password",dec_password);
    if (!dec_password) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Password mismatch",
        result: {},
      });
    }

    const _id = admin._id;
    const token = await generateAccessToken({
      _id: admin._id,
      email: admin.email,
      role: "admin", // extra info add kar sakte ho
    });

    admin.accesstoken = token;
    await admin.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Admin login successful",
      result: {
        _id,
        token,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in admin login API",
      result: {},
    });

  }
};

const VALID_LANGUAGES = ["English", "Hindi"];

export const getCurrentLanguage = async (req, res) => {
  try {
    const token = req.token;
    const patient = await Patient.findOne({ _id: token._id });

    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }

    if (patient.status === "Delete") {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Patient account has been deleted",
        result: {},
      });
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Language fetched successfully",
      result: {
        name: patient.fullName,
        email: patient.email,
        language: patient.language,
      },
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " Error in get current language API",
      result: {},
    });
  }
};

export const changePatientLanguage = async (req, res) => {
  try {
    const token = req.token;
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Language required",
        result: {},
      });
    }

    if (!VALID_LANGUAGES.includes(language)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid language. Only English and Hindi are allowed",
        result: {},
      });
    }

    const patient = await Patient.findOne({ _id: token._id });

    if (!patient) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }

    if (patient.status === "Delete") {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Patient account has been deleted",
        result: {},
      });
    }

    if (patient.language === language) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: `Language already set to ${language}`,
        result: {},
      });
    }

    patient.language = language;
    await patient.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Language changed successfully",
      result: {
        language: patient.language,
      },
    });
  } catch (error) {
    console.error("Error!!", error);
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message || "Internal server error",
      result: {},
    });
  }
};