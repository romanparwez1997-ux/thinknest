import mongoose, { Schema, models } from "mongoose";

const testAttemptSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  studentAnswers: [{
    questionId: { type: Schema.Types.ObjectId, required: true },
    selectedOptionIndex: { type: Number, default: null } // null means they skipped it
  }]
}, { timestamps: true });

const TestAttempt = models.TestAttempt || mongoose.model("TestAttempt", testAttemptSchema);
export default TestAttempt;