import CareNote from "../../models/guardiansModel/careModel.js";
import Patient from "../../models/patientModel.js";
import Guardian from "../../models/guardiansModel/guardianModel.js";
import Caretaker from "../../models/caretakerModel/caretakerModel.js";

// 1️⃣ Add CareNote
export const addCareNote = async (req, res) => {
  try {
    let token = req.token; // token se patient/guardian identify hoga
    const { patientId, guardianId, caretakerId, title, noteType, description, date, status } = req.body;

    // Validations
    if (!patientId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient ID is required",
        result: {},
      });
    }

    // if (!guardianId) {
    //   return res.send({
    //     statusCode: 400,
    //     success: false,
    //     message: "Guardian ID is required",
    //     result: {},
    //   });
    // }

    if (!description) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Description is required",
        result: {},
      });
    }

    // Validate patient exists
    const patient = await Patient.findOne({ _id: patientId, status: "Active" });
    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found or inactive",
        result: {},
      });
    }

    // Validate guardian exists
    const guardian = await Guardian.findOne({ _id: token._id, status: "Active" });
    if (!guardian) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Guardian not found or inactive",
        result: {},
      });
    }

    // Validate receiver if provided
    if (caretakerId) {
      const caretaker = await Caretaker.findOne({ _id: caretakerId, status: "Active" });
      if (!caretaker) {
        return res.send({
          statusCode: 404,
          success: false,
          message: "Receiver (Caretaker) not found or inactive",
          result: {},
        });
      }
    }

    // Create CareNote object
    const newCareNote = new CareNote({
      patientId,
      guardianId:token._id,
      caretakerId: caretakerId  || null,
      title: title?.trim() || "",
      noteType: noteType || "other",
      description: description?.trim(),
      date: date || "",
      status: status || "Active",
    });

    await newCareNote.save();

    return res.send({
      statusCode: 200,
      success: true,
      message: "CareNote added successfully",
      result: newCareNote,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in add CareNote API",
      result: {},
    });
  }
};

// 2️⃣ Get All CareNotes
// export const getAllCareNotes = async (req, res) => {
//   try {
//     const careNotes = await CareNote.find();
//     const total = await CareNote.countDocuments();

//     return res.send({
//       statusCode: 200,
//       success: true,
//       message: "CareNotes fetched successfully",
//       total,
//       result: careNotes,
//     });
//   } catch (error) {
//     return res.send({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in getAll CareNotes API",
//       result: {},
//     });
//   }
// };


export const getAllCareNotes = async (req, res) => {
  try {
    const token = req.token; // guardian identification from middleware

    // --- Validate Guardian ---
    if (!token || !token._id) {
      return res.status(401).json({
        statusCode: 401,
        success: false,
        message: "Invalid or missing token",
        result: {},
      });
    }

    const guardian = await Guardian.findById(token._id).select("fullName");
    if (!guardian) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Guardian not found",
        result: {},
      });
    }

    // --- Fetch Care Notes & Populate ---
    const careNotes = await CareNote.find({ guardianId: token._id })
      .populate({
        path: "patientId",
        model: Patient,
        select: "fullName age gender mobileNumber",
      })
      .populate({
        path: "caretakerId",
        model: Caretaker,
        select: "fullName mobileNumber relation",
      })
      .sort({ createdAt: -1 });

    const total = await CareNote.countDocuments({ guardianId: token._id });

    // --- Response ---
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Care Notes fetched successfully",
      guardianName: guardian.fullName,
      total,
      result: careNotes,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message + " — ERROR in getAllCareNotes API",
      result: {},
    });
  }
};

// 3️⃣ Get CareNote by ID
export const getCareNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const careNote = await CareNote.findById(id);

    if (!careNote) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "CareNote not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "CareNote fetched successfully",
      result: careNote,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in get CareNote API",
      result: {},
    });
  }
};

// 4️⃣ Update CareNote by ID
export const updateCareNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Optional: validations for update fields
    if (updates.patientId) {
      const patient = await Patient.findOne({ _id: updates.patientId, status: "Active" });
      if (!patient) {
        return res.send({
          statusCode: 404,
          success: false,
          message: "Patient not found or inactive",
          result: {},
        });
      }
    }

    if (updates.guardianId) {
      const guardian = await Guardian.findOne({ _id: updates.guardianId, status: "Active" });
      if (!guardian) {
        return res.send({
          statusCode: 404,
          success: false,
          message: "Guardian not found or inactive",
          result: {},
        });
      }
    }

    if (updates.receiverId) {
      const caretaker = await Caretaker.findOne({ _id: updates.receiverId, status: "Active" });
      if (!caretaker) {
        return res.send({
          statusCode: 404,
          success: false,
          message: "Receiver (Caretaker) not found or inactive",
          result: {},
        });
      }
    }

    const updatedCareNote = await CareNote.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedCareNote) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "CareNote not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "CareNote updated successfully",
      result: updatedCareNote,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in update CareNote API",
      result: {},
    });
  }
};

// 5️⃣ Delete CareNote by ID (Soft delete)
export const deleteCareNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCareNote = await CareNote.findByIdAndUpdate(id, { status: "Deleted" }, { new: true });

    if (!deletedCareNote) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "CareNote not found",
        result: {},
      });
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "CareNote deleted successfully",
      result: deletedCareNote,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in delete CareNote API",
      result: {},
    });
  }
};

