import bcrypt from "bcryptjs";
import Guardian from "../../models/guardiansModel/guardianModel.js";
import Admin from "../../models/adminModel.js";
import { generateAccessToken, generateRefreshToken } from "../../../helpers/jwt.js";

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
      .select("-password");

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
