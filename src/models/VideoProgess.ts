import mongoose, { Schema, models } from "mongoose";

const videoProgressSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  progressSeconds: { type: Number, required: true, default: 0 },
  totalSeconds: { type: Number, required: true },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure a student can only have one progress record per video
videoProgressSchema.index({ studentId: 1, videoId: 1 }, { unique: true });

const VideoProgress = models.VideoProgress || mongoose.model("VideoProgress", videoProgressSchema);
export default VideoProgress;