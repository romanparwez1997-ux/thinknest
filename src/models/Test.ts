import mongoose, { Schema, models } from "mongoose";

const questionSchema = new Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of strings e.g., ["A", "B", "C", "D"]
  correctOptionIndex: { type: Number, required: true }, // e.g., 2 (which means "C")
  explanation: { type: String, required: true } // Shown only AFTER they submit
});

const testSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  durationMinutes: { type: Number, required: true }, // For the React countdown timer
  questions: [questionSchema],
}, { timestamps: true });

const Test = models.Test || mongoose.model("Test", testSchema);
export default Test;