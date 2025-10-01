import Caretaker from "../../models/caretakerModel/caretakerModel.js";
import Admin from "../../models/adminModel.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../../../helpers/jwt.js";

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


export const getAllCaretakersByAdmin = async (req, res) => {
  try {
    const token = req.token;
    let { page = 1, limit = 10, search = "" } = req.query;
    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    const skip = (page - 1) * limit;

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

    const caretakers = await Caretaker.find(searchFilter)
      .select("-password -refreshToken")
      .skip(skip)
      .limit(limit);

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
