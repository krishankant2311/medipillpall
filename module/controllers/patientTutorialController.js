// controllers/tutorialController.js

import Tutorial from "../models/patientTutorialModel.js"
import Admin from "../models/adminModel.js"
import Patient from "../models/patientModel.js"

// ================= CREATE =================

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
    let token = req.token
    let { title, description } = req.body
    let videoFile = req.file

    if (!title) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Title is required",
        result: {},
      })
    }

    if (!description) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Description is required",
        result: {},
      })
    }

    if (!videoFile) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Video file is required",
        result: {},
      })
    }

    const admin = await Admin.findById(token._id)

    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized: Only active admins can create tutorials",
        result: {},
      })
    }

    const videoUrl = "/uploads/videos/" + videoFile.filename

    const tutorial = await Tutorial.create({
      title,
      description,
      videoUrl,
      adminId: admin._id,
    })

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorial created successfully",
      result: tutorial,
    })
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in createTutorial API",
    })
  }
}

// ---------------- Edit Tutorial (with video upload) ----------------
export const editTutorial = async (req, res) => {
  try {
    let { id } = req.params
    let adminToken = req.token
    let { title, description } = req.body
    let videoFile = req.file

    if(!id){
      return res.send({
        statusCode: 400,
        success: false,
        message: "Tutorial ID required",
        result: {},
      })
    }

    const admin = await Admin.findById(adminToken._id)

    if (!admin || admin.status !== "Active") {
      return res.send({
        statusCode: 401,
        success: false,
        message: "Unauthorized: Only active admins can edit tutorials",
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

    // Update fields if provided
    if (title) tutorial.title = title
    if (description) tutorial.description = description
    // if (status) tutorial.status = status
    if (videoFile) tutorial.videoUrl = "/uploads/videos/" + videoFile.filename

    await tutorial.save()

    return res.send({
      statusCode: 200,
      success: true,
      message: "Tutorial updated successfully",
      result: tutorial,
    })
  } catch (error) {
    return res.send({
      statusCode: 500,
      success: false,
      message: error.message + " Error in editTutorial API",
    })
  }
}

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

