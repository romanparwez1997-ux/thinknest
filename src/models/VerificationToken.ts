import mongoose from "mongoose";

const VerificationTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['signup', '2fa'], // Keeps track of what this code is actually for
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // THE MAGIC: 600 seconds = 10 minutes. MongoDB auto-deletes this document after 10 mins!
  }
});

const VerificationToken = mongoose.models.VerificationToken || mongoose.model("VerificationToken", VerificationTokenSchema);

export default VerificationToken;