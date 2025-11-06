// controllers/tutorialController.js

import Tutorial from "../models/patientTutorialModel.js"
import Admin from "../models/adminModel.js"
import Patient from "../models/patientModel.js"
import Caretaker from "../models/caretakerModel/caretakerModel.js"
import Guardian from "../models/guardiansModel/guardianModel.js"

import multer from "multer"
import path from "path"

// ---------------- Multer Storage Setup ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/videos") // Video files saved here
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

export const uploadVideo = multer({ storage: storage }).single("video") 
// frontend se 'video' field name bhejna hoga

// ---------------- Create Tutorial (with video upload) ----------------
export const createTutorial = async (req, res) => {
  try {
    const token = req.token;
    const { title, description } = req.body;
    const videoFile = req.file;

    // Step 1: Validate inputs
    if (!title) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Title is required",
        result: {},
      });
    }

    if (!description) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Description is required",
        result: {},
      });
    }

    if (!videoFile) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Video file is required",
        result: {},
      });
    }

    // Step 2: Validate admin
    const admin = await Admin.findById(token._id);
    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized: Only active admins can create tutorials",
        result: {},
      });
    }

    // Step 3: Build full video URL
    const videoUrl = `${req.protocol}://${req.get("host")}/uploads/${videoFile.filename}`;

    // Step 4: Save to DB
    const tutorial = await Tutorial.create({
      title,
      description,
      videoUrl,
      adminId: admin._id,
    });

    // Step 5: Response
    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorial created successfully",
      result: tutorial,
    });
  } catch (error) {
    console.error("❌ Error in createTutorial:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in createTutorial API",
    });
  }
};

// ---------------- Edit Tutorial (with video upload) ----------------
export const editTutorial = async (req, res) => {
  try {
    const { id } = req.params;
    const adminToken = req.token;
    const { title, description } = req.body;
    const videoFile = req.file;

    // 🧩 Step 1: Validate ID
    if (!id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Tutorial ID is required",
        result: {},
      });
    }

    // 🧩 Step 2: Validate admin
    const admin = await Admin.findById(adminToken._id);
    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized: Only active admins can edit tutorials",
        result: {},
      });
    }

    // 🧩 Step 3: Find tutorial
    const tutorial = await Tutorial.findOne({ _id: id });
    if (!tutorial) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Tutorial not found",
        result: {},
      });
    }

    // 🧩 Step 4: Update fields only if provided
    if (title) tutorial.title = title;
    if (description) tutorial.description = description;

    // 🧩 Step 5: Update video (if new file uploaded)
    if (videoFile) {
      // Full URL for accessing video
      const videoUrl = `${req.protocol}://${req.get("host")}/uploads/videos/${videoFile.filename}`;
      tutorial.videoUrl = videoUrl;
    }

    await tutorial.save();

    // 🧩 Step 6: Success response
    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorial updated successfully",
      result: tutorial,
    });
  } catch (error) {
    console.error("❌ Error in editTutorial:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in editTutorial API",
    });
  }
};

// ================= GET ONE (ADMIN) =================

export const getTutorialByAdmin = async (req, res) => {
  try {
    let token = req.token
    let { id } = req.params


    const admin = await Admin.findById(token._id)

    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      })
    }

    const tutorial = await Tutorial.findById(id)

    if (!tutorial) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Tutorial not found",
        result: {},
      })
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorial fetched successfully",
      result: tutorial,
    })
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getTutorialByAdmin API",
    })
  }
}

// ================= GET ONE (PATIENT) =================

export const getTutorialByPatient = async (req, res) => {
  try {
    let token = req.token
    let { id } = req.params

  if (!id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Tutorial ID required",
        result: {},
      })
    }

    const patient = await Patient.findById(token._id)

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      })
    }

    const tutorial = await Tutorial.findOne({ _id: id, status: "Active" })

    if (!tutorial) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Tutorial not found or not active",
        result: {},
      })
    }

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorial fetched successfully",
      result: tutorial,
    })
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getTutorialByPatient API",
    })
  }
}

// ================= GET ALL (ADMIN) =================

export const getAllTutorialsByAdmin = async (req, res) => {
  try {
    let token = req.token

    if (!adminToken || !adminToken._id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Admin token required",
        result: {},
      })
    }

    const admin = await Admin.findById(token._id)

    if (!admin) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Admin not found",
        result: {},
      })
    }

    const tutorials = await Tutorial.find()

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorials fetched successfully",
      result: tutorials,
    })
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getAllTutorialsByAdmin API",
    })
  }
}

// ================= GET ALL (PATIENT) =================

export const getAllTutorialsByPatient = async (req, res) => {
  try {
    let token = req.token

    if (!patientToken || !patientToken._id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Patient token required",
        result: {},
      })
    }

    const patient = await Patient.findById(token._id)

    if (!patient) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Patient not found",
        result: {},
      })
    }

    const tutorials = await Tutorial.find({ status: "Active" })

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorials fetched successfully",
      result: tutorials,
    })
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getAllTutorialsByPatient API",
    })
  }
}

// ================= DELETE =================

// ---------------- Delete Tutorial ----------------
export const deleteTutorial = async (req, res) => {
  try {
    let { id } = req.params
    let adminToken = req.token

    if (!adminToken || !adminToken._id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Admin token required",
        result: {},
      })
    }

    const admin = await Admin.findById(adminToken._id)

    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized: Only active admins can delete tutorials",
        result: {},
      })
    }

    if (!id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Tutorial ID required",
        result: {},
      })
    }

    const tutorial = await Tutorial.findById(id)

    if (!tutorial) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Tutorial not found",
        result: {},
      })
    }

    // Permanent delete नहीं, सिर्फ status "Delete" करना
    tutorial.status = "Delete"
    await tutorial.save()

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorial deleted successfully",
      result: tutorial,
    })
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in deleteTutorial API",
    })
  }
}

export const getAllTutorialsByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token

    // 🧩 Step 1: Validate caretaker token
    if (!token || !token._id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Caretaker token required",
        result: {},
      });
    }

    // 🧩 Step 2: Verify caretaker exists and active
    const caretaker = await Caretaker.findById(token._id);
    if (!caretaker || caretaker.status !== "Active") {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Caretaker not found or inactive",
        result: {},
      });
    }

    // 🧩 Step 3: Fetch all active tutorials
    const tutorials = await Tutorial.find({ status: "Active" }).sort({ createdAt: -1 });

    // 🧩 Step 4: Response
    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorials fetched successfully",
      result: tutorials,
    });
  } catch (error) {
    console.error("❌ Error in getAllTutorialsByCaretaker:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getAllTutorialsByCaretaker API",
    });
  }
};


export const getSingleTutorialByCaretaker = async (req, res) => {
  try {
    const token = req.token; // caretaker token
    const { tutorialId } = req.params; // tutorial ID from route

    // 🧩 Step 1: Validate ID
    if (!tutorialId) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Tutorial ID is required",
        result: {},
      });
    }

    // 🧩 Step 2: Validate caretaker
    if (!token || !token._id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Caretaker token required",
        result: {},
      });
    }

    const caretaker = await Caretaker.findById(token._id);
    if (!caretaker || caretaker.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized: Only active caretakers can access tutorials",
        result: {},
      });
    }

    // 🧩 Step 3: Fetch tutorial
    const tutorial = await Tutorial.findOne({ _id: tutorialId, status: "Active" });

    if (!tutorial) {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Tutorial not found",
        result: {},
      });
    }

    // 🧩 Step 4: Success response
    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorial fetched successfully",
      result: tutorial,
    });
  } catch (error) {
    console.error("❌ Error in getSingleTutorialByCaretaker:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getSingleTutorialByCaretaker API",
    });
  }
};

export const getAllTutorialsByGuardian = async (req, res) => {
  try {
    const token = req.token; // guardian token

    // 🧩 Step 1: Validate guardian token
    if (!token || !token._id) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Guardian token required",
        result: {},
      });
    }

    // 🧩 Step 2: Verify guardian exists and active
    const guardian = await Guardian.findOne({_id:token._id});
    console.log("Guardian found:", guardian);
    if (!guardian || guardian.status !== "Active") {
      return res.send({
        statusCode: 404,
        success: false,
        message: "Guardian not found or inactive",
        result: {},
      });
    }

    // 🧩 Step 3: Fetch all active tutorials
    const tutorials = await Tutorial.find({ status: "Active" }).sort({ createdAt: -1 });

    // 🧩 Step 4: Response
    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorials fetched successfully",
      result: tutorials,
    });
  } catch (error) {
    console.error("❌ Error in getAllTutorialsByGuardian:", error);
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in getAllTutorialsByGuardian API",
    });
  }
};
