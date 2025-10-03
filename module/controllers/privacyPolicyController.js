import PrivacyPolicy from "../models/privacyPolicyModel.js";
import Admin from "../models/adminModel.js";
import Patient from "../models/patientModel.js";
import Guardian from "../../module/models/guardiansModel/guardianModel.js";
import Caretaker from "../models/caretakerModel/caretakerModel.js";

export const createPrivacyPolicy = async (req, res) => {
  try {
    let token = req.token;
    let { content } = req.body;

    if (!content) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Content is required",
        result: {},
      });
    }

    let admin = await Admin.findOne({ _id: token._id });
    if (!admin) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Admin not found",
        result: {},
      });
    }

    if (admin.status === "Delete") {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Admin is deleted",
        result: {},
      });
    }

    const policy = await PrivacyPolicy.findOne({});
    if (policy) {
      policy.content = content;
      await policy.save();
      return res.send({
        statusCode: 200,
        success: true,
        message: "Privacy policy updated successfully",
        result: { policy },
      });
    }

    const createPrivacyPolicy = new PrivacyPolicy({ content });
    await createPrivacyPolicy.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Privacy policy created successfully",
      result: { policy: createPrivacyPolicy },
    });
  } catch (error) {
    console.log(error);
    return res.send({
      statusCode: 400,
      success: false,
      message: "Error in creating privacy policy " + error.message,
      result: {},
    });
  }
};

export const getPrivacyPolicy = async (req, res) => {
  try {
    let token = req.token;

    let admin = await Admin.findOne({ _id: token._id, status: "Active" });
    let patient = await Patient.findOne({ _id: token._id, status: "Active" });
    let guardian = await Guardian.findOne({ _id: token._id, status: "Active" });
    let caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!(admin || patient || guardian || caretaker)) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Unauthorized access",
        result: {},
      });
    }

    let policy = await PrivacyPolicy.findOne({});
    if (!policy) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Privacy policy not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Privacy policy fetched successfully",
      result: {
        _id: policy._id,
        content: policy.content,
        status: policy.status,
      },
    });
  } catch (error) {
    console.log(error);
    return res.send({
      statusCode: 500,
      success: false,
      message: "Error in getting privacy policy API " + error.message,
      result: {},
    });
  }
};
