import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will store this as a hashed string
  role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// If the model already exists, use it. Otherwise, create a new one.
export default mongoose.models.User || mongoose.model('User', UserSchema);