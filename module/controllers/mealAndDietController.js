import MealAndDiet from "../models/mealAndDietModel.js";
import Caretaker from "../models/caretakerModel/caretakerModel.js";
import Patient from "../models/patientModel.js";

// 🥗 Add Meal or Diet (Caretaker)
export const addMealAndDiet = async (req, res) => {
  try {
    // token se caretaker identify hoga
    const token = req.token;
    const { patientId } = req.params;

    const {
      type,
      mealType,
      scheduleTime,
      foodType,
      portionSize,
      specialDietFollowed,
      remarks,
      planName,
      startDate,
      endDate,
      calories,
      instructions,
      dailyMeals
    } = req.body;

    // 🧩 caretaker validate karo
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active"
    });

    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid caretaker"
      });
    }

    // 🧩 patient validate karo
    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active"
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // 🌐 Base URL (for full file path)
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // 🖼️ Multiple meal photos (array)
    let mealPhotos = [];
    if (req.files && req.files.length > 0) {
      mealPhotos = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    }

    // 📄 Single diet doc (if uploaded)
    const attachedDoc =
      req.file && type === "Diet"
        ? `${baseUrl}/uploads/dietDocs/${req.file.filename}`
        : "";

    // 🧩 dailyMeals agar array string me aaye to parse karo
    let dailyMealsData = [];
    if (dailyMeals) {
      dailyMealsData =
        typeof dailyMeals === "string"
          ? JSON.parse(dailyMeals)
          : dailyMeals;
    }

    // 🧩 data prepare karo
    const data = {
      caretakerId: caretaker._id,
      patientId: patient._id,
      type: type || "Meal",
      mealType: mealType || "",
      scheduleTime: scheduleTime || "",
      foodType: foodType || "",
      portionSize: portionSize || "",
      specialDietFollowed: specialDietFollowed || "",
      remarks: remarks || "",
      planName: planName || "",
      startDate: startDate || null,
      endDate: endDate || null,
      instructions: instructions || "",
      dailyMeals: dailyMealsData,
      calories: calories || "",
      mealPhoto: type === "Meal" ? mealPhotos : [],
      attachedDoc
    };

    // 🧩 document save karo
    const newEntry = new MealAndDiet(data);
    await newEntry.save();

    // ✅ response
    return res.status(200).json({
      success: true,
      message: `${type} added successfully`,
      result: newEntry
    });
  } catch (error) {
    console.error("Add Meal/Diet Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// export const addMealAndDiet = async (req, res) => {
//   try {
//     // token se caretaker identify hoga
//     const token = req.token;
// const {patientId} = req.params;
//     const {
//       type,
//       mealType,
//       scheduleTime,
//       foodType,
//       portionSize,
//       specialDietFollowed,
//       remarks,
//       planName,
//       startDate,
//       endDate,
//       instructions,
//       dailyMeals
//     } = req.body;

//     // 🧩 caretaker validate karo
//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active"
//     });

//     if (!caretaker) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid caretaker"
//       });
//     }

//     // 🧩 patient validate karo
//     const patient = await Patient.findOne({
//       _id: patientId,
//       status: "Active"
//     });

//     if (!patient) {
//       return res.status(404).json({
//         success: false,
//         message: "Patient not found"
//       });
//     }

//     // 🌐 Base URL set karo (live or local)
//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     // 🧩 file path agar upload hua ho
//     const filePath = req.file
//       ? type === "Meal"
//         ? `${baseUrl}/uploads/mealPhotos/${req.file.filename}`
//         : `${baseUrl}/uploads/dietDocs/${req.file.filename}`
//       : "";

//     // 🧩 dailyMeals agar array string me aaye to parse karo
//     let dailyMealsData = [];
//     if (dailyMeals) {
//       dailyMealsData =
//         typeof dailyMeals === "string"
//           ? JSON.parse(dailyMeals)
//           : dailyMeals;
//     }

//     // 🧩 data prepare karo
//     const data = {
//       caretakerId: caretaker._id,
//       patientId: patient._id,
//       type: type || "Meal",
//       mealType: mealType || "",
//       scheduleTime: scheduleTime || "",
//       foodType: foodType || "",
//       portionSize: portionSize || "",
//       specialDietFollowed: specialDietFollowed || "",
//       remarks: remarks || "",
//       planName: planName || "",
//       startDate: startDate || null,
//       endDate: endDate || null,
//       instructions: instructions || "",
//       dailyMeals: dailyMealsData,
//       mealPhoto: type === "Meal" ? filePath : "",
//       attachedDoc: type === "Diet" ? filePath : ""
//     };

//     // 🧩 document save karo
//     const newEntry = new MealAndDiet(data);
//     await newEntry.save();

//     // ✅ response
//     return res.status(200).json({
//       success: true,
//       message: `${type} added successfully`,
//       result: newEntry
//     });
//   } catch (error) {
//     console.error("Add Meal/Diet Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


// 🧾 Get All Meal and Diet (Caretaker)
// export const getAllMealAndDiet = async (req, res) => {
//   try {
//     const token = req.token; // caretaker token
//     const { patientId } = req.query;

//     // 🧩 caretaker validate karo
//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active"
//     });

//     if (!caretaker) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid caretaker"
//       });
//     }

//     // 🧩 Query prepare karo
//     const query = {
//       caretakerId: caretaker._id
//     };

//     if (patientId) {
//       query.patientId = patientId;
//     }

//     // 🌐 Base URL (for exact file path)
//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     // 🧩 Data fetch karo
//     const records = await MealAndDiet.find(query)
//       .populate("patientId", "fullName age gender")
//       .sort({ createdAt: -1 });

//     // 🧩 File URLs fix karo (ensure exact path)
//     const result = records.map((item) => ({
//       _id: item._id,
//       caretakerId: item.caretakerId,
//       patientId: item.patientId,
//       type: item.type,
//       mealType: item.mealType,
//       scheduleTime: item.scheduleTime,
//       foodType: item.foodType,
//       portionSize: item.portionSize,
//       specialDietFollowed: item.specialDietFollowed,
//       remarks: item.remarks,
//       planName: item.planName,
//       startDate: item.startDate,
//       endDate: item.endDate,
//       instructions: item.instructions,
//       dailyMeals: item.dailyMeals,
//       mealPhoto: item.mealPhoto
//         ? item.mealPhoto.startsWith("http")
//           ? item.mealPhoto
//           : `${baseUrl}${item.mealPhoto}`
//         : "",
//       attachedDoc: item.attachedDoc
//         ? item.attachedDoc.startsWith("http")
//           ? item.attachedDoc
//           : `${baseUrl}${item.attachedDoc}`
//         : "",
//       createdAt: item.createdAt
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Meal and Diet records fetched successfully",
//       result
//     });
//   } catch (error) {
//     console.error("Get Meal/Diet Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


export const getAllMealAndDiet = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const {  date } = req.query; // 👈 date query me milega (YYYY-MM-DD)
 const { patientId } = req.params;
    // 🧩 caretaker validate karo
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active"
    });

    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid caretaker"
      });
    }

    // 🧩 Query prepare karo
    const query = { caretakerId: caretaker._id };
    if (patientId) query.patientId = patientId;

    // 🧩 Date filter (agar date diya gaya hai)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // 🌐 Base URL (for exact file path)
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // 🧩 Data fetch karo
    const records = await MealAndDiet.find(query)
      .populate("patientId", "fullName age gender")
      .sort({ createdAt: -1 });

    // 🧩 File URLs fix karo (array-safe version)
    const result = records.map((item) => {
      let mealPhotos = [];

      // ✅ handle multiple meal photos safely
      if (Array.isArray(item.mealPhoto)) {
        mealPhotos = item.mealPhoto.map((photo) =>
          photo.startsWith("http") ? photo : `${baseUrl}${photo}`
        );
      } else if (typeof item.mealPhoto === "string" && item.mealPhoto) {
        mealPhotos = [item.mealPhoto.startsWith("http") ? item.mealPhoto : `${baseUrl}${item.mealPhoto}`];
      }

      // ✅ handle attachedDoc safely
      const attachedDoc =
        item.attachedDoc && typeof item.attachedDoc === "string"
          ? item.attachedDoc.startsWith("http")
            ? item.attachedDoc
            : `${baseUrl}${item.attachedDoc}`
          : "";

      return {
        _id: item._id,
        caretakerId: item.caretakerId,
        patientId: item.patientId,
        type: item.type,
        mealType: item.mealType,
        scheduleTime: item.scheduleTime,
        foodType: item.foodType,
        portionSize: item.portionSize,
        specialDietFollowed: item.specialDietFollowed,
        remark: item.remark,
        planName: item.planName,
        startDate: item.startDate,
        endDate: item.endDate,
        instructions: item.instructions,
        dailyMeals: item.dailyMeals,
        mealPhoto: mealPhotos, // always array
        attachedDoc,
        taskStatus:item.taskStatus,
        calories: item.calories,
        status: item.status,
        createdAt: item.createdAt
      };
    });

    return res.status(200).json({
      success: true,
      message: "Meal and Diet records fetched successfully",
      result
    });
  } catch (error) {
    console.error("Get Meal/Diet Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// export const getAllMealAndDiet = async (req, res) => {
//   try {
//     const token = req.token; // caretaker token
//     const { patientId } = req.query;

//     // 🧩 caretaker validate karo
//     const caretaker = await Caretaker.findOne({
//       _id: token._id,
//       status: "Active"
//     });

//     if (!caretaker) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid caretaker"
//       });
//     }

//     // 🧩 Query prepare karo
//     const query = { caretakerId: caretaker._id };
//     if (patientId) query.patientId = patientId;

//     // 🌐 Base URL (for exact file path)
//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     // 🧩 Data fetch karo
//     const records = await MealAndDiet.find(query)
//       .populate("patientId", "fullName age gender")
//       .sort({ createdAt: -1 });

//     // 🧩 File URLs fix karo (array-safe version)
//     const result = records.map((item) => {
//       let mealPhotos = [];

//       // ✅ handle multiple meal photos safely
//       if (Array.isArray(item.mealPhoto)) {
//         mealPhotos = item.mealPhoto.map((photo) =>
//           photo.startsWith("http") ? photo : `${baseUrl}${photo}`
//         );
//       } else if (typeof item.mealPhoto === "string" && item.mealPhoto) {
//         mealPhotos = [item.mealPhoto.startsWith("http") ? item.mealPhoto : `${baseUrl}${item.mealPhoto}`];
//       }

//       // ✅ handle attachedDoc safely
//       const attachedDoc =
//         item.attachedDoc && typeof item.attachedDoc === "string"
//           ? item.attachedDoc.startsWith("http")
//             ? item.attachedDoc
//             : `${baseUrl}${item.attachedDoc}`
//           : "";

//       return {
//         _id: item._id,
//         caretakerId: item.caretakerId,
//         patientId: item.patientId,
//         type: item.type,
//         mealType: item.mealType,
//         scheduleTime: item.scheduleTime,
//         foodType: item.foodType,
//         portionSize: item.portionSize,
//         specialDietFollowed: item.specialDietFollowed,
//         remarks: item.remarks,
//         planName: item.planName,
//         startDate: item.startDate,
//         endDate: item.endDate,
//         instructions: item.instructions,
//         dailyMeals: item.dailyMeals,
//         mealPhoto: mealPhotos, // always array
//         attachedDoc,
//         status: item.status,
//         createdAt: item.createdAt
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Meal and Diet records fetched successfully",
//       result
//     });
//   } catch (error) {
//     console.error("Get Meal/Diet Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


export const deleteMealAndDiet = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { id } = req.params; // Meal/Diet record ID

    // 🧩 Validate caretaker
    const caretaker = await Caretaker.findOne({ _id: token._id, status: "Active" });
    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid caretaker",
      });
    }

    // 🧩 Find the record
    const record = await MealAndDiet.findOne({
      _id: id,
      caretakerId: caretaker._id,
      status: { $ne: "Deleted" },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Meal or Diet record not found or already deleted",
      });
    }

    // 🧩 Soft delete (mark as Deleted)
    record.status = "Deleted";
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Meal or Diet record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Meal/Diet Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const editMealAndDietByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { mealId } = req.params;

    const {
      type,
      mealType,
      scheduleTime,
      foodType,
      portionSize,
      specialDietFollowed,
      remarks,
      planName,
      startDate,
      endDate,
      calories,
      instructions,
      dailyMeals
    } = req.body;

    // 🧩 Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active"
    });

    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid caregiver"
      });
    }

    // 🧩 Find Existing Meal/Diet Record
    const existing = await MealAndDiet.findOne({
      _id: mealId,
      caretakerId: caretaker._id
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Meal/Diet record not found"
      });
    }

    // 🌐 Base URL
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // 🖼️ Multiple new meal photos (if uploaded)
    let mealPhotos = existing.mealPhoto;
    if (req.files && req.files.length > 0) {
      mealPhotos = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    }

    // 📄 Single diet doc (if uploaded)
    let attachedDoc = existing.attachedDoc;
    if (req.file && type === "Diet") {
      attachedDoc = `${baseUrl}/uploads/dietDocs/${req.file.filename}`;
    }

    // 🧩 dailyMeals parse if string
    let dailyMealsData = existing.dailyMeals;
    if (dailyMeals) {
      dailyMealsData =
        typeof dailyMeals === "string"
          ? JSON.parse(dailyMeals)
          : dailyMeals;
    }
    // if(mealPhotos.length === 0 && type === "Meal"){
    //   return res.status(400).json({
    //     success: false,
    //     message: "At least one meal photo is required for Meal type"
    //   });
    // }
    if(mealPhotos.length > 10 && type === "Meal"){
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 10 meal photos"
      });
    } 

    // 🧩 Update data
    existing.type = type ?? existing.type;
    existing.mealType = mealType ?? existing.mealType;
    existing.scheduleTime = scheduleTime ?? existing.scheduleTime;
    existing.foodType = foodType ?? existing.foodType;
    existing.portionSize = portionSize ?? existing.portionSize;
    existing.specialDietFollowed = specialDietFollowed ?? existing.specialDietFollowed;
    existing.remarks = remarks ?? existing.remarks;
    existing.planName = planName ?? existing.planName;
    existing.startDate = startDate ?? existing.startDate;
    existing.endDate = endDate ?? existing.endDate;
    existing.instructions = instructions ?? existing.instructions;
    existing.dailyMeals = dailyMealsData;
    existing.calories = calories ?? existing.calories;
    existing.mealPhoto = type === "Meal" ? mealPhotos : existing.mealPhoto;
    existing.attachedDoc = attachedDoc;

    await existing.save();

    return res.json({
      success: true,
      message: `${existing.type} updated successfully`,
      result: existing
    });

  } catch (error) {
    console.error("Edit Meal/Diet Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const addMealAndDietByPatient = async (req, res) => {
  try {
    // 🔐 Patient Token
    const token = req.token;
    const patientId = token._id;

    const {
      type,                  // "Meal" / "Diet"
      mealType,              // Breakfast / Lunch / Dinner
      scheduleTime,
      foodType,
      portionSize,
      specialDietFollowed,
      remarks,
      calories,
      instructions,
      time,
    } = req.body;

    // ---------------------------
    // 1️⃣  Validate Patient
    // ---------------------------
    const patient = await Patient.findOne({
      _id: patientId,
      status: "Active"
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    // ---------------------------
    // 2️⃣ Build Base URL
    // ---------------------------
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // ---------------------------
    // 3️⃣ Multiple Meal Photos
    // ---------------------------
    let mealPhotos = [];
    if (req.files && req.files.length > 0) {
      mealPhotos = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    }

    // ---------------------------
    // 4️⃣ Diet Doc (optional)
    // ---------------------------
    const attachedDoc =
      req.file && type === "Diet"
        ? `${baseUrl}/uploads/dietDocs/${req.file.filename}`
        : "";

    // ---------------------------
    // 5️⃣ Data Prepare
    // ---------------------------
    const data = {
      patientId,
      type: type || "Meal",
      mealType: mealType || "",
      scheduleTime: scheduleTime || "",
      foodType: foodType || "",
      portionSize: portionSize || "",
      specialDietFollowed: specialDietFollowed || "",
      remarks: remarks || "",
      instructions: instructions || "",
      calories: calories || "",
      status: "Active",          // patient adds = completed
      date: new Date(),             // current day
      mealPhoto: type === "Meal" ? mealPhotos : [],
      attachedDoc,
      time: time || ""
    };

    // ---------------------------
    // 6️⃣ Save Document
    // ---------------------------
    const newEntry = new MealAndDiet(data);
    await newEntry.save();

    // ---------------------------
    // 7️⃣ Response
    // ---------------------------
    return res.status(200).json({
      success: true,
      message: `${type || "Meal"} added successfully`,
      result: newEntry
    });

  } catch (error) {
    console.error("Add Meal/Diet Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const addRemarksByCaretaker = async (req, res) => {
  try {
    const token = req.token;
    const { mealandDietId } = req.params;
    const { remark } = req.body;
    // 🧩 Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active"
    });
    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid caregiver",
      });
    }
    // 🧩 Find Existing Meal/Diet Record
    const existing = await MealAndDiet.findOne({
      _id:mealandDietId,
      // caretakerId: caretaker._id
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Meal/Diet record not found"
      });
    }
    // 🧩 Update remarks
    existing.remark = remark || existing.remark;
    await existing.save();
    return res.json({
      success: true,
      message: `Remarks updated successfully`,
      result: existing
    });
  }
  catch (error) {
    console.error("Add Remarks Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStatusByCaregiver = async (req, res) => {
  try {
    const token = req.token;  
    const { mealandDietId } = req.params;
    const { taskStatus } = req.body; // New status value
    // 🧩 Validate Caretaker
    const caretaker = await Caretaker.findOne({
      _id: token._id,
      status: "Active"
    });
    if (!caretaker) {
      return res.status(401).json({
        success: false,
        message: "Invalid caregiver",
      });
    }
    // 🧩 Find Existing Meal/Diet Record
    const existing = await MealAndDiet.findOne({
      _id: mealandDietId,
      // caretakerId: caretaker._id
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Meal/Diet record not found"
      });
    }
    // 🧩 Update task status
    existing.taskStatus = taskStatus || existing.taskStatus;
    await existing.save();
    return res.json({
      success: true,
      message: `Task status updated successfully`,
      result: existing
    });
  }
  catch (error) {
    console.error("Update Task Status Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


