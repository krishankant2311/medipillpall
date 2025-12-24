import Appointment from "../models/patientAppointmentModel.js";
import Patient from "../models/patientModel.js";

// 🟩 Add Appointment by Patient
export const addAppointmentByPatient = async (req, res) => {
  try {
    const token = req.token;   // patient token
    const { title, time, reason, date } = req.body;

    // ✔ Validate patient
    const patient = await Patient.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // ✔ Create appointment
    const newAppointment = await Appointment.create({
      title,
      time,
      reason,
      date,
      patientId: patient._id,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment added successfully",
      data: newAppointment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "ERROR IN add appointment by patient api : " + error.message,
    });
  }
};


// 🟦 Edit Appointment by Patient
export const editAppointmentByPatient = async (req, res) => {
  try {
    const token = req.token;
    const { appointmentId } = req.params;
    const { title, time, reason, date } = req.body;

    // ✔ Validate patient
    const patient = await Patient.findOne({
      _id: token._id,
      status: "Active",
    });

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }

    // ✔ Check appointment belongs to same patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patient._id,
      status: "Active",
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // ✔ Update
    appointment.title = title ?? appointment.title;
    appointment.time = time ?? appointment.time;
    appointment.reason = reason ?? appointment.reason;
    appointment.date = date ?? appointment.date;

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "ERROR IN edit appointment by patient api : " + error.message,
    });
  }
};

export const getAllAppointmentsByPatient = async (req, res) => {
  try {
    const token = req.token; // patient token
    // ✔ Validate patient

    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }
    // ✔ Fetch appointments
    const appointments = await Appointment.find({ patientId: patient._id, status: { $ne: "Deleted" } }).sort({ date: -1, time: -1 });

    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments,
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "ERROR IN get all appointments by patient api : " + error.message,
    });
  }
};


export const getAppointmentDetailsByPatient = async (req, res) => {
  try {
    const token = req.token;
    const { id } = req.params;
    // ✔ Validate patient
    const patient = await Patient.findOne({ _id: token._id, status: "Active" });
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Patient not found or inactive",
      });
    }
    // ✔ Fetch appointment details
    const appointment = await Appointment.findOne({ _id: id, patientId: patient._id, status: { $ne: "Deleted" } });
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Appointment details fetched successfully",
      data: appointment,
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "ERROR IN get appointment details by patient api : " + error.message,
    });
  }
};
