import GuardianReminder from "../../models/guardiansModel/reminderModel.js"

import Guardian from "../../models/guardiansModel/guardianModel.js"; // Guardian model import
export const saveReminder = async (req, res) => {
  try {
    const token = req.token; // Guardian identification

    // --- Token validation ---
    if (!token || !token._id) {
      return res.status(401).send({
        statusCode: 401,
        success: false,
        message: "Invalid token",
        result: {},
      });
    }

    const { reminderTitle, description, type, priority, date, time } = req.body

    // --- Validation ---
    if (!reminderTitle || !reminderTitle.trim()) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Reminder title is required",
        result: {},
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Description is required",
        result: {},
      });
    }

    if (!type) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Type is required",
        result: {},
      });
    }

    if (!priority) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Priority is required",
        result: {},
      });
    }

    // --- Fetch Guardian ---
    const guardian = await Guardian.findOne({ _id:token._id, status: "Active" });
    if (!guardian) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: "Guardian not found or inactive",
        result: {},
      });
    }

    // --- Create new reminder ---
    const reminder = new GuardianReminder({
      guardianId: token._id,
      reminderTitle: reminderTitle.trim(),
      description: description.trim(),
      type,
      priority,
      date,
      time
    });
    
    await reminder.save();

    // --- Return only reminder details ---
    return res.status(200).send({
      statusCode: 200,
      success: true,
      message: "Reminder created successfully",
      result: {
        reminder
      },
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in saveReminder API",
      result: {},
    });
  }
};



// export const saveReminder = async (req, res) => {
//   try {
//     const token = req.token; // Guardian identify
//     const { reminderTitle, description, type, priority, date, time } = req.body || {};

//     // --- Validation ---
//     if (!reminderTitle || !reminderTitle.trim()) {
//       return res.status(400).send({
//         statusCode: 400,
//         success: false,
//         message: "Reminder title is required",
//         result: {},
//       });
//     }

//     if (!description || !description.trim()) {
//       return res.status(400).send({
//         statusCode: 400,
//         success: false,
//         message: "Description is required",
//         result: {},
//       });
//     }

//     if (!type) {
//       return res.status(400).send({
//         statusCode: 400,
//         success: false,
//         message: "Type is required",
//         result: {},
//       });
//     }

//     if (!priority) {
//       return res.status(400).send({
//         statusCode: 400,
//         success: false,
//         message: "Priority is required",
//         result: {},
//       });
//     }

//     // --- Validate Guardian ---
//    const guardian = await Guardian.findOne({ _id: token._id, status: "Active" });

// if (!guardian) {
//   return res.status(404).send({
//     statusCode: 404,
//     success: false,
//     message: "Guardian not found or inactive",
//     result: {},
//   });
// }

// console.log("guardian",guardian)
//     // --- Create new reminder ---
//     const reminder = new GuardianReminder({
//       guardianId: guardian._id,
//       reminderTitle: reminderTitle.trim(),
//       description: description.trim(),
//       type,
//       priority,
//       date: date || null,
//       time: time || "00:00",
//     });
// await reminder.save();

// return res.status(200).send({
//   statusCode: 200,
//   success: true,
//   message: "Reminder created successfully",
//   result: {
//     _id: reminder._id,
//     reminderTitle: reminder.reminderTitle,
//     description: reminder.description,
//     type: reminder.type,
//     priority: reminder.priority,
//     date: reminder.date,
//     time: reminder.time,
//     guardianId: reminder.guardianId,
//     createdAt: reminder.createdAt,
//     updatedAt: reminder.updatedAt
//   }
// });

//   } catch (error) {
//     return res.status(500).send({
//       statusCode: 500,
//       success: false,
//       message: error.message + " ERROR in saveReminder API",
//       result: {},
//     });
//   }
// };


// GET all reminders for Guardian
export const getReminders = async (req, res) => {
  try {
    const token = req.token;
    const reminders = await GuardianReminder.find({ guardianId:token._id }).sort({ createdAt: -1 });
    if (!reminders) {
      return res.send({
        statusCode: 404,  
        success: false,
        message: "No reminders found",
        result: {},
      });
    }
    return res.send({
      statusCode: 200,
      success: true,
      message: "Reminders fetched successfully",
      result: reminders,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getReminders API",
      result: {},
    });
  }
};

// GET single reminder by ID (Guardian can only access own reminders)
export const getReminderById = async (req, res) => {
  try {
    const token = req.token;
    const { id } = req.params;
    const reminder = await GuardianReminder.findOne({ _id:id, guardianId: token._id });
    if (!reminder) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Reminder not found",
        result: {},
      });
    }
    console.log("reminder",reminder)
    return res.send({
      statusCode: 200,
      success: true,
      message: "Reminder fetched successfully",
      result: reminder,
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getReminderById API",
      result: {},
    });
  }
};

// DELETE reminder (Guardian can only delete own reminders)
export const deleteReminder = async (req, res) => {
  try {
    const token = req.token;
    const { id } = req.params;
    const reminder = await GuardianReminder.findOneAndDelete({ _id: id, guardianId: token._id });
    if (!reminder) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Reminder not found",
        result: {},
      });
    }
    return res.send({
      statusCode: 200,
      success: true,
      message: "Reminder deleted successfully",
      result: {},
    });
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in deleteReminder API",
      result: {},
    });
  }
};

export const editReminder = async (req, res) => {
  try {
    const token = req.token; // Guardian identification

    // --- Token validation ---
    if (!token || !token._id) {
      return res.status(401).send({
        statusCode: 401,
        success: false,
        message: "Invalid token",
        result: {},
      });
    }

    const { reminderId, reminderTitle, description, type, priority, date, time } = req.body;

    // --- Validation ---
    if (!reminderId) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Reminder ID is required",
        result: {},
      });
    }

    if (!reminderTitle || !reminderTitle.trim()) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Reminder title is required",
        result: {},
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Description is required",
        result: {},
      });
    }

    if (!type) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Type is required",
        result: {},
      });
    }

    if (!priority) {
      return res.status(400).send({
        statusCode: 400,
        success: false,
        message: "Priority is required",
        result: {},
      });
    }

    // --- Verify Guardian ---
    const guardian = await Guardian.findOne({ _id: token._id, status: "Active" });
    if (!guardian) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: "Guardian not found or inactive",
        result: {},
      });
    }

    // --- Find Reminder ---
    const reminder = await GuardianReminder.findOne({ _id: reminderId, guardianId: token._id });
    if (!reminder) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: "Reminder not found",
        result: {},
      });
    }

    // --- Update Fields ---
    reminder.reminderTitle = reminderTitle.trim();
    reminder.description = description.trim();
    reminder.type = type;
    reminder.priority = priority;
    reminder.date = date;
    reminder.time = time;

    await reminder.save();

    // --- Return updated reminder ---
    return res.status(200).send({
      statusCode: 200,
      success: true,
      message: "Reminder updated successfully",
      result: {
        reminder,
      },
    });

  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in editReminder API",
      result: {},
    });
  }
};


export const getAllReminders = async (req, res) => {
  try {
    const token = req.token; // Admin identification

    // --- Token validation ---
    if (!token || !token._id) {
      return res.status(401).send({
        statusCode: 401,
        success: false,
        message: "Invalid token",
        result: {},
      });
    }

    // --- Verify Admin ---
    const admin = await Admin.findOne({ _id: token._id, status: "Active" });
    if (!admin) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: "Admin not found or inactive",
        result: {},
      });
    }

    // --- Fetch All Reminders ---
    const reminders = await GuardianReminder.find()
      .populate("guardianId", "fullName email mobileNumber") // optional: show guardian details
      .sort({ createdAt: -1 }); // latest first

    if (!reminders || reminders.length === 0) {
      return res.status(404).send({
        statusCode: 404,
        success: false,
        message: "No reminders found",
        result: [],
      });
    }

    // --- Return reminders list ---
    return res.status(200).send({
      statusCode: 200,
      success: true,
      message: "All reminders fetched successfully",
      result: reminders,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      success: false,
      message: error.message + " ERROR in getAllReminders API",
      result: {},
    });
  }
};
