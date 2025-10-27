import Caretaker from "../../models/caretakerModel/caretakerModel.js";
import Admin from "../../models/adminModel.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../../helpers/jwt.js";
import genrateOTP from "../../../helpers/generateOtp.js";
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
    let { page = 1, limit = 10, search = "" } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    const skip = (page - 1) * limit;
    // :white_tick: Check admin authorization
    const adminUser = await Admin.findOne({ _id: token._id, status: "Active" });
    if (!adminUser) {
      return res.status(403).send({
        statusCode: 403,
        success: false,
        message: "Access denied: Admins only",
        result: {},
      });
    }
    if (adminUser.status === "Delete") {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Your account has been deleted",
        result: {},
      });
    }
    // :white_tick: Build search filter
    const searchRegex = new RegExp(search.trim(), "i");
    const searchFilter = search.trim()
      ? {
          status: { $ne: "Delete" },
          $or: [
            { fullName: { $regex: searchRegex } },
            { mobileNumber: { $regex: searchRegex } },
            { email: { $regex: searchRegex } },
          ],
        }
      : { status: { $ne: "Delete" } };
    // :white_tick: Fetch caretakers with populated references
    const caretakers = await Caretaker.find(searchFilter)
      .select("-password -refreshToken -otp -refreshToken -accessToken ")
      .populate({
        path: "patients",
        select: "fullName gender mobileNumber status createdAt age", // include needed fields only
      })
      .populate({
        path: "guardianId",
        select: "fullName gender mobileNumber email status createdAt", // include needed fields only
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCaretakers = await Caretaker.countDocuments(searchFilter);
    return res.send({
      statusCode: 200,
      success: true,
      message: "All caretakers fetched successfully (Admin)",
      result: {
        caretakers,
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

    if (!/^\d+$/.test(mobileNumber)) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "mobileNumber must contain only numbers",
        result: {},
      });
    }

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