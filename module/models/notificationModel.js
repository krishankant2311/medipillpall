import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    imageUrl: { type: String, default: null },

    targetPlayerIds: [
      { type: String, default: null }
    ],

    userType: {
  type: String,
  enum: ["Guardian", "Caregiver", "Patient", "All"],
  required: true
},

    guardianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Guardian",
        // default: null,
    },
status: { type: String, enum: ["Sent", "Pending", "Failed"], default: "Failed" },
    caretakerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Caretaker",
        // default: null,
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        // default: null,
    },
    type: { type: String, default: "General" },
    data: { type: Object, default: {} },


    targetUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      }
    ],
    isSeen:{
      type: Boolean,
      default: false
    },

    sentToAll: { type: Boolean, default: false },

    onesignalResponse: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
