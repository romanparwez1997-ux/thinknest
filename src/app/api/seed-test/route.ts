import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Test from "@/models/Test";

export async function GET() {
  try {
    await connectMongo();

    const newTest = await Test.create({
      title: "Frontend Web Development Fundamentals",
      durationMinutes: 10,
      questions: [
        {
          text: "What does HTML stand for?",
          options: [
            "Hyper Text Preprocessor",
            "Hyper Text Markup Language",
            "Hyper Terminal Motor Logic",
            "High Text Machine Language"
          ],
          correctOptionIndex: 1,
          explanation: "HTML stands for Hyper Text Markup Language. It is the standard markup language for creating Web pages."
        },
        {
          text: "Which of the following is NOT a JavaScript framework/library?",
          options: ["React", "Angular", "Django", "Vue"],
          correctOptionIndex: 2,
          explanation: "Django is a Python web framework, not a JavaScript framework."
        },
        {
          text: "What is the purpose of CSS?",
          options: [
            "To structure the web page",
            "To add logic and interactivity",
            "To style and visually format the web page",
            "To manage the database"
          ],
          correctOptionIndex: 2,
          explanation: "Cascading Style Sheets (CSS) is used for describing the presentation of a document written in HTML."
        }
      ]
    });

    return NextResponse.json({ 
      message: "Success! Demo test planted in database.", 
      testId: newTest._id 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to seed test" }, { status: 500 });
  }
}