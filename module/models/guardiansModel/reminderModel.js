import mongoose from 'mongoose';

const guardianReminderSchema = new mongoose.Schema(
  {
    guardianId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Guardian", 
      def:""
    //   required: true 
    },

    reminderTitle: { 
      type: String, 
    //   trim: true, 
      default: "" 
    },

    description: { 
      type: String, 
    //   trim: true, 
      default: "" 
    },

    type: { 
      type: String, 
      enum: ['Personal', 'Work', 'Health', 'Other'], 
      default: "Other" 
    },

    priority: { 
      type: String, 
      enum: ['Low', 'Medium', 'High'], 
      default: "Low" 
    },

    date: { 
      type: Date, 
      default: null 
    },

    time: { 
      type: String, 
      default: "00:00" 
    },

    status: { 
      type: String, 
      enum: ["Active", "Inactive"], 
      default: "Active" 
    }
  },
  { 
    timestamps: true 
  }
);

// ✅ Prevent OverwriteModelError
export default mongoose.model('GuardianReminder', guardianReminderSchema);
