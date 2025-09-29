import TermsCondition from "../models/termsAndConditionsModel.js";

// ✅ Add Terms & Conditions (Admin only)
export const addTermsCondition = async (req, res) => {
  try {
    const token = req.token; 

    const { content } = req.body;

    const terms = new TermsCondition({
      content: content || "",
    });

    await terms.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Terms & Conditions added successfully",
      result: terms,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ✅ Update Terms & Conditions (Admin only)
export const updateTermsCondition = async (req, res) => {
  try {
    const token = req.token;

    const { id, content } = req.body;

    if (!id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "id is required",
      });
    }

    const terms = await TermsCondition.findByIdAndUpdate(
      id,
      { content: content || "" },
      { new: true }
    );

    if (!terms) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Terms & Conditions not found",
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Terms & Conditions updated successfully",
      result: terms,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// ✅ Get Terms & Conditions (for anyone, no token required)
export const getTermsCondition = async (req, res) => {
  try {
    const terms = await TermsCondition.find().sort({ createdAt: -1 });

    return res.send({
      statusCode: 200,
      success: true,
      message: "Terms & Conditions fetched successfully",
      result: terms,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
