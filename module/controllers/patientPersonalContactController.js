import Patient from "../models/patientModel.js";
import PersonalContact from "../models/patientPersonalContactModel.js";

// Add Personal Contact
export const addPersonalContact = async (req, res) => {
  try {
    let token = req.token;
    const { contactName, phoneNo, relationship, isEmergency } = req.body;

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Invalid patient token",
        result: {},
      });
    }

    const newContact = new PersonalContact({
      patient_id: patient._id,
      contactName,
      phoneNo,
      relationship,
      isEmergency,
    });

    await newContact.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Personal contact added successfully",
      result: newContact,
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

// Edit Personal Contact
export const editPersonalContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { contactName, phoneNo, relationship, isEmergency } = req.body;

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

    const contact = await PersonalContact.findOne({ _id: contactId, status: "Active" });
    if (!contact) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Personal contact not found",
        result: {},
      });
    }

    if (contact.patient_id.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to edit this contact",
        result: {},
      });
    }

    contact.contactName = contactName || contact.contactName;
    contact.phoneNo = phoneNo || contact.phoneNo;
    contact.relationship = relationship || contact.relationship;
    contact.isEmergency = isEmergency !== undefined ? isEmergency : contact.isEmergency;

    await contact.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Personal contact updated successfully",
      result: contact,
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

// Get Personal Contacts
export const getPersonalContacts = async (req, res) => {
  try {
    let token = req.token;
    let { page = 1, limit = 10, patientId } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let query = {};
    if (patientId) {
      query.patient_id = patientId;
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
      query.patient_id = patient._id;
    }

    query.status = "Active";

    const contacts = await PersonalContact.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await PersonalContact.countDocuments(query);

    return res.send({
      statusCode: 200,
      success: true,
      message: "Personal contacts fetched successfully",
      result: contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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

// Delete Personal Contact (soft delete)
export const deletePersonalContact = async (req, res) => {
  try {
    const { contactId } = req.params;
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

    const contact = await PersonalContact.findById(contactId);
    if (!contact) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Personal contact not found",
        result: {},
      });
    }

    if (contact.patient_id.toString() !== patient._id.toString()) {
      return res.send({
        statusCode: 403,
        success: false,
        message: "Unauthorized to delete this contact",
        result: {},
      });
    }

    contact.status = "Delete";
    await contact.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "Personal contact deleted successfully",
      result: contact,
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
