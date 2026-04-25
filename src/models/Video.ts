import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  videoUrl: { type: String, required: true }, // The AWS S3 Public Link
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);