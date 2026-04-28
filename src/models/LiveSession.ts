import mongoose from 'mongoose';

const LiveSessionSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorName: { type: String, required: true }, // Saved here so we don't have to look up the user every time
  meetingLink: { type: String, required: true }, // The Zoom/Meet link for premium students!
  createdAt: { type: Date, default: Date.now },

  isCompleted: { 
      type: Boolean, 
      default: false 
    },

    recordingUrl: { 
      type: String, 
      required: false // Optional, because it won't exist until the class is over!
    }
  
},

{ timestamps: true }
);




const LiveSession = mongoose.models.LiveSession || mongoose.model("LiveSession", LiveSessionSchema);

export default LiveSession;