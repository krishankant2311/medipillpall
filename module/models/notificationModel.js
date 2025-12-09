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
      enum: ["Guardian", "Patient", "Caretaker", "All"],
      default: "All",
    },

    targetUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      }
    ],

    sentToAll: { type: Boolean, default: false },

    onesignalResponse: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
