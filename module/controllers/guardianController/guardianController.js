import bcrypt from "bcryptjs";
import Guardian from "../../models/guardiansModel/guardianModel.js";
import Admin from "../../models/adminModel.js";
import { generateAccessToken, generateRefreshToken } from "../../../helpers/jwt.js";
import { genrateOTP } from "../../../helpers/generateOtp.js";
export const addGuardian = async (req, res) => {
  try {
    let { fullName, mobileNumber, email, password } = req.body;

    fullName = fullName?.trim()?.toLowerCase();
    mobileNumber = mobileNumber?.trim();
    email = email?.trim()?.toLowerCase();

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

    const guardianExist = await Guardian.findOne({
      $or: [{ mobileNumber }, { email }],
    });
    if (guardianExist) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Guardian already exists",
        result: {},
      });
    }

    const enc_password = bcrypt.hashSync(password, 10);

    const newGuardian = new Guardian({
      fullName,
      mobileNumber,
      email,
      password: enc_password,
    });

    const accessToken = generateAccessToken({
      _id: newGuardian._id,
      mobileNumber,
    });
    const refreshToken = generateRefreshToken({
      _id: newGuardian._id,
      mobileNumber,
    });

    newGuardian.accessToken = accessToken;
    newGuardian.refreshToken = refreshToken;

    await newGuardian.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Guardian added successfully",
      result: newGuardian,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};


export const signupGuardian = async (req, res) => {
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

    // if (!password) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     success: false,
    //     message: "Required password",
    //     result: {},
    //   });
    // }

    // if (password.length < 8) {
    //   return res.status(400).json({
    //     statusCode: 400,
    //     success: false,
    //     message: "Password must be at least 8 characters long",
    //     result: {},
    //   });
    // }

    // Step 4: Check if guardian already exists
    const guardianExist = await Guardian.findOne({
      $or: [{ mobileNumber }, { email }],
    });

    // Step 5: If guardian exists
    if (guardianExist) {
      // Step 5a: If status is Pending → resend OTP allowed
      if (guardianExist.status === "Pending") {
        const { otpValue, otpExpiry } = genrateOTP();
        guardianExist.otp = { otpValue, otpExpiry };
        await guardianExist.save();

        return res.status(200).json({
          statusCode: 200,
          success: true,
          message: "OTP resent successfully",
          result: { mobileNumber: guardianExist.mobileNumber, otpValue, otpExpiry },
        });
      }

      // Step 5b: If status is Active → cannot add again
      if (guardianExist.status === "Active") {
        return res.status(400).json({
          statusCode: 400,
          success: false,
          message: "Guardian already exists",
          result: {},
        });
      }
    }

    // Step 6: If guardian does not exist → generate OTP
    const { otpValue, otpExpiry } = genrateOTP();

    // Step 7: Create new guardian instance with Pending status
    // const enc_password = bcrypt.hashSync(password, 10);

    const newGuardian = new Guardian({
      fullName,
      mobileNumber,
      email,
      // password: enc_password,
      status: "Pending",
      otp: { otpValue, otpExpiry },
    });

    // Step 8: Save new guardian to DB
    await newGuardian.save();

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

export const getAllGuardiansByAdmin = async (req, res) => {
  try {
    const token = req.token;
    let { page = 1, limit = 10, search = "" } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    const skip = (page - 1) * limit;

    const adminUser = await Admin.findById(token._id);
    if (!adminUser || adminUser.status !== "Active") {
      return res.status(403).send({
        statusCode: 403,
        success: false,
        message: "Access denied: Admins only",
        result: {},
      });
    }

    const searchRegex = new RegExp(search.trim(), "i");
    const searchFilter = search.trim()
      ? {
          status: "Active",
          $or: [{ fullName: { $regex: searchRegex } }, { email: { $regex: searchRegex } }],
        }
      : { status: "Active" };

    const guardians = await Guardian.find(searchFilter)
      .skip(skip)
      .limit(limit)
      // .select("-password");

    const totalGuardians = await Guardian.countDocuments(searchFilter);

    return res.send({
      statusCode: 200,
      success: true,
      message: "All guardians fetched successfully (Admin)",
      result: {
        guardians,
        currentPage: page,
        totalPage: Math.ceil(totalGuardians / limit),
        totalRecord: totalGuardians,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllGuardiansByAdmin API",
      result: {},
    });
  }
};

export const guardianLogin = async (req, res) => {
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

    const guardian = await Guardian.findOne({ mobileNumber });
    if (!guardian) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "guardian not found",
        result: {},
      });
    }

    if (guardian.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "user has been deleted",
        result: {},
      });
    }

    const { otpValue, otpExpiry } = genrateOTP();

    guardian.otp = {
      otpValue,
      otpExpiry,
    };

    await guardian.save();

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
      message: error.message + " Error in guardian login API",
      result: {},
    });
  }
};

export const verifyGuardianOTP = async (req, res) => {
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

    // Step 1: Guardian exist check
    const guardian = await Guardian.findOne({ mobileNumber });
    if (!guardian) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Guardian not found",
        result: {},
      });
    }

   // Step 2a: Check if OTP object exists
if (!guardian.otp) {
  return res.status(400).json({
    statusCode: 400,
    success: false,
    message: "OTP has not been generated yet",
    result: {},
  });
}

// Step 2b: Check if OTP value exists
if (!guardian.otp.otpValue) {
  return res.status(400).json({
    statusCode: 400,
    success: false,
    message: "OTP value is missing",
    result: {},
  });
}

// Step 2c: Check if OTP is expired
const currentTime = new Date();
if (guardian.otp.otpExpiry < currentTime) {
  return res.status(400).json({
    statusCode: 400,
    success: false,
    message: "OTP has expired. Please request a new one",
    result: {},
  });
}


    // Step 3: OTP match check
    if (guardian.otp.otpValue !== otp) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid OTP",
        result: {},
      });
    }

    // ✅ Step 4: OTP verified → generate tokens
    const accessToken = generateAccessToken({ _id: guardian._id, mobileNumber });
    const refreshToken = generateRefreshToken({ _id: guardian._id, mobileNumber });

    // OTP clear after successful verification
    guardian.otp = {};
    guardian.status = "Active"; // Status change to Active after OTP verification
    await guardian.save();

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "OTP verified successfully",
      result: {
        guardian,
        accessToken,
        refreshToken,
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
