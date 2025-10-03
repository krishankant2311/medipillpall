import Visitor from "../models/patientVisitorsModel.js";
import Patient from "../models/patientModel.js";
import Admin from "../models/adminModel.js";
// ✅ Add Visitor
// ✅ Add Visitor
export const addVisitor = async (req, res) => {
  try {
    let token = req.token;
    const { name, duration, reason, caretakerId } = req.body;

    // Required fields check
if (!name) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Name is required",
        result: {},
      });
    }

    if (!duration) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Duration is required",
        result: {},
      });
    }

    if (!reason) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Reason is required",
        result: {},
      });
    }

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const newVisitor = new Visitor({
      patientId: patient._id,
      caretakerId,
      name,
      duration,
      reason,
    });

    await newVisitor.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Visitor added successfully",
      result: newVisitor,
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


// ✅ Edit Visitor
export const editVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;
    const { name, duration, reason, status } = req.body;

    let token = req.token;
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const visitor = await Visitor.findOne({ _id: visitorId, status: { $ne: "Deleted" } });
    if (!visitor) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Visitor not found",
        result: {},
      });
    }

    if (visitor.patientId.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to edit this visitor",
        result: {},
      });
    }

    visitor.name = name || visitor.name;
    visitor.duration = duration || visitor.duration;
    visitor.reason = reason || visitor.reason;
    visitor.status = status || visitor.status;

    await visitor.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Visitor updated successfully",
      result: visitor,
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

// ✅ Get Visitors (with pagination)
export const getVisitors = async (req, res) => {
  try {
    let token = req.token;
    let { visitorId } = req.query;

    // page = parseInt(page);
    // limit = parseInt(limit);

    let query = { status: { $ne: "Deleted" } };

    if (visitorId) {
      query.visitorId = visitorId;
    } else {
      const patient = await Patient.findOne({ _id: token._id, status: "Active" });
      if (!patient) {
        return res.send({
          statusCode: 401,
          success: false,
          message: "Invalid patient token",
          result: {},
        });
      }
      query.patientId = patient._id;
    }

    const visitors = await Visitor.find(query)
      .populate("patientId")
      .populate("caretakerId")
    //   .skip((page - 1) * limit)
    //   .limit(limit)
      .sort({ createdAt: -1 });

    // const total = await Visitor.countDocuments(query);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Visitors fetched successfully",
      result: visitors,
    //   pagination: {
    //     total,
    //     page,
    //     limit,
    //     totalPages: Math.ceil(total / limit),
    //   },
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

// ✅ Get All Visitors (no pagination)
export const getAllVisitors = async (req, res) => {
  try {
    let token = req.token;
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });

    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const visitors = await Visitor.find({
      patientId: patient._id,
      status: { $ne: "Deleted" },
    })
      .populate("patientId")
      .populate("caretakerId")
      .sort({ createdAt: -1 });

    return res.send({
      statusCode: 200,
      success: true,
      message: "All visitors fetched successfully",
      result: visitors,
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

// ✅ Delete Visitor (soft delete)
export const deleteVisitor = async (req, res) => {
  try {
    const { visitorId } = req.params;
    let token = req.token;

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Visitor not found",
        result: {},
      });
    }
    if(visitor.status === "Deleted"){
        return res.send({
            statusCode: 400,   
            success: false,
            message: "Visitor already deleted",
            result: {},
            });
    }

    if (visitor.patientId.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to delete this visitor",
        result: {},
      });
    }

    visitor.status = "Deleted";
    await visitor.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Visitor deleted successfully",
      result: visitor,
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

// Get All Visitors (Admin only)
export const getAllVisitorsByAdmin = async (req, res) => {
  try {
    const token = req.token; // assuming verifyAccessToken middleware sets req.token
    if (!token) {
      return res.status(401).send({
        statusCode: 401,
        success: false,
        message: "Unauthorized: No token provided",
        result: {},
      });
    }

    // Fetch the user from DB
    const adminUser = await Admin.findById(token._id);
    if (!adminUser || adminUser.status !== "Active") {
      return res.status(403).send({
        statusCode: 403,
        success: false,
        message: "Access denied: Admins only",
        result: {},
      });
    }

    // Fetch visitors
    const visitors = await Visitor.find()
      .populate("patientId", "fullName age gender")
      .populate("caretakerId", "fullName relation");

    return res.status(200).send({
      statusCode: 200,
      success: true,
      message: "Visitors fetched successfully (Admin)",
      result: visitors,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {},
    });
  }
};
