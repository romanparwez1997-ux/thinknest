import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Test from "@/models/Test";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: { testId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const test = await Test.findById(params.testId);
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    // 🛑 CHEAT PREVENTION: Map over the questions and delete the answers/explanations
    const secureQuestions = test.questions.map((q: any) => ({
      _id: q._id,
      text: q.text,
      options: q.options,
      // Notice we are NOT sending correctOptionIndex or explanation!
    }));

    const secureTest = {
      _id: test._id,
      title: test.title,
      durationMinutes: test.durationMinutes,
      questions: secureQuestions
    };

    return NextResponse.json(secureTest, { status: 200 });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}