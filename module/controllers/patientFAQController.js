// controllers/faqController.js

// ================= IMPORTS =================
import FAQ from "../models/patientFAQModel.js";
import Admin from "../models/adminModel.js";
import Patient from "../models/patientModel.js";

// ================= CREATE FAQ (Admin Only) =================
export const createFAQ = async (req, res) => {
  try {
    let { question, answer } = req.body;
    let token = req.token;

    if (!question) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Question required",
        result: {},
      });
    }

    if (!answer) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Answer required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ _id: token._id });

    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized or inactive admin",
        result: {},
      });
    }

    const faq = await FAQ.findOne({
      question: { $regex: question, $options: "i" },status:"Active",
    });

    if (faq) {
      if (faq.status === "Active") {
        return res.send({
          statusCode: 403,
          success: false,
          message: "FAQ already exists",
          result: {},
        });
      }

      if (faq.status === "Delete") {
        faq.question = question;
        faq.answer = answer;
        faq.status = "Active";
        await faq.save();

        return res.send({
          statusCode: 200,
          success: true,
          message: "FAQ created successfully",
          result: faq,
        });
      }
    }

    const createNewFAQ = new FAQ({
      question,
      answer,
      status: "Active",
    });

    await createNewFAQ.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "FAQ created successfully",
      result: createNewFAQ,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in createFAQ",
      result: {},
    });
  }
};

// ================= EDIT FAQ (Admin Only) =================
export const editFAQ = async (req, res) => {
  try {
    let token = req.token;
    let { faqId } = req.params;
    let { question, answer, status } = req.body;

    if (!faqId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "FAQ id required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ _id: token._id });

    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized or inactive admin",
        result: {},
      });
    }

    const faq = await FAQ.findOne({ _id: faqId, status: "Active" });

    if (!faq) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "FAQ not found",
        result: {},
      });
    }

    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    faq.status = status || faq.status;

    await faq.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "FAQ updated successfully",
      result: faq,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in editFAQ",
      result: {},
    });
  }
};

// ================= GET SINGLE FAQ (Admin Only) =================
export const getFAQ = async (req, res) => {
  try {
    let token = req.token;
    let faqId = req.params.id;

    if (!faqId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "FAQ id is required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ _id: token._id });

    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized or inactive admin",
        result: {},
      });
    }

    const faq = await FAQ.findOne({ _id:faqId});

    if (!faq || faq.status === "Delete") {
      return res.send({
        statusCode: 404,
        success: false,
        message: "FAQ not found or deleted",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "FAQ fetched successfully",
      result: faq,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getFAQ",
      result: {},
    });
  }
};

// ================= DELETE FAQ (Admin Only) =================
export const deleteFAQ = async (req, res) => {
  try {
    let token = req.token;
    let { faqId } = req.params;

    if (!faqId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "FAQ id is required",
        result: {},
      });
    }

    const admin = await Admin.findOne({ _id: token._id });

    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized or inactive admin",
        result: {},
      });
    }

    const faq = await FAQ.findOne({ _id: faqId });

    if (!faq || faq.status === "Delete") {
      return res.send({
        statusCode: 404,
        success: false,
        message: "FAQ not found or already deleted",
        result: {},
      });
    }

    faq.status = "Delete";
    await faq.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "FAQ deleted successfully",
      result: faq,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in deleteFAQ",
      result: {},
    });
  }
};

// ================= GET ALL FAQ (Admin with search & pagination) =================
export const getAllFAQ = async (req, res) => {
  try {
    let token = req.token;
    let { page = 1, limit = 10, search = "" } = req.query;

    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    const skip = (page - 1) * limit;

    const admin = await Admin.findOne({ _id: token._id });

    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized or inactive admin",
        result: {},
      });
    }

    const searchRegex = new RegExp(search.trim(), "i");

    const searchFilter = search.trim()
      ? {
          status: "Active",
          $or: [{ question: { $regex: searchRegex } }, { answer: { $regex: searchRegex } }],
        }
      : { status: "Active" };

    const allFAQ = await FAQ.find(searchFilter).skip(skip).limit(limit);

    const totalFAQ = await FAQ.countDocuments(searchFilter);

    return res.send({
      statusCode: 200,
      success: true,
      message: "All FAQ fetched successfully",
      result: {
        FAQ: allFAQ,
        currentPage: page,
        totalPage: Math.ceil(totalFAQ / limit),
        totalRecord: totalFAQ,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getAllFAQ",
      result: {},
    });
  }
};

// ================= GET ALL FAQ (Patient Side) =================
export const getAllFAQByPatient = async (req, res) => {
  try {
    let token = req.token;
    let { page = 1, limit = 10 } = req.query;

    page = Number.parseInt(page);
    limit = Number.parseInt(limit);
    const skip = (page - 1) * limit;

    const patient = await Patient.findOne({ _id: token._id });

    if (!patient || patient.status !== "Active") {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized or inactive patient",
        result: {},
      });
    }

    const allFAQ = await FAQ.find({ status: "Active" }).skip(skip).limit(limit);

    const totalFAQ = await FAQ.countDocuments({ status: "Active" });

    return res.send({
      statusCode: 200,
      success: true,
      message: "All FAQ fetched successfully",
      result: {
        FAQ: allFAQ,
        currentPage: page,
        totalPage: Math.ceil(totalFAQ / limit),
        totalRecord: totalFAQ,
      },
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getAllFAQByPatient",
      result: {},
    });
  }
};
