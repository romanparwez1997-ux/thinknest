import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Test from "@/models/Test";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // 1. Security: Only Tutors can create tests
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized. Tutors only." }, { status: 401 });
    }

    const { title, durationMinutes, questions } = await req.json();

    if (!title || !durationMinutes || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await connectMongo();

    // 2. Save the Master Copy to the database
    const newTest = await Test.create({
      title,
      durationMinutes,
      questions
    });

    return NextResponse.json({ message: "Test created successfully", testId: newTest._id }, { status: 201 });

  } catch (error) {
    console.error("Test Creation Error:", error);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}