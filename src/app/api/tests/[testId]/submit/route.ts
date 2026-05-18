import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Test from "@/models/Test";
import TestAttempt from "@/models/TestAttempt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request, { params }: { params: { testId: string } }) {
  try {
    // 1. Security: Who is submitting this test?
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers } = await req.json(); // Array of { questionId, selectedOptionIndex }
    
    await connectMongo();

    // 2. Fetch the Master Copy of the test (which contains the correct answers)
    const test = await Test.findById(params.testId);
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    let score = 0;
    const totalQuestions = test.questions.length;

    // 3. THE AUTO-GRADER ENGINE
    // We loop through the master copy, NOT the student's answers, to ensure they 
    // didn't try to inject fake extra questions.
    const processedAnswers = test.questions.map((question: any) => {
      
      // Find what the student answered for this specific question
      const studentAnswer = answers.find((a: any) => a.questionId === question._id.toString());
      const selectedOptionIndex = studentAnswer && studentAnswer.selectedOptionIndex !== undefined 
        ? studentAnswer.selectedOptionIndex 
        : null; // null means they skipped it
      
      // Compare it to the answer key
      if (selectedOptionIndex !== null && selectedOptionIndex === question.correctOptionIndex) {
        score += 1;
      }

      return {
        questionId: question._id,
        selectedOptionIndex
      };
    });

    // 4. Print the Receipt (Save to Database)
    const attempt = await TestAttempt.create({
      studentId: (session.user as any).id,
      testId: test._id,
      score,
      totalQuestions,
      studentAnswers: processedAnswers
    });

    // 5. Send the final grade back to the frontend
    return NextResponse.json({ 
      message: "Test graded successfully!", 
      score, 
      total: totalQuestions,
      attemptId: attempt._id 
    }, { status: 200 });

  } catch (error) {
    console.error("Grader Error:", error);
    return NextResponse.json({ error: "Failed to grade test" }, { status: 500 });
  }
}