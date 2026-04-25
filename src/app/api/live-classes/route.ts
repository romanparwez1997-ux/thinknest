import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Double check this path!
import connectMongo from "@/lib/mongodb";
import LiveSession from "@/models/LiveSession"; // Using your exact model name!

// 1. FETCH CLASSES (GET)
export async function GET() {
  try {
    await connectMongo();
    
    // Fetch classes that haven't happened yet, sort by closest date
    const classes = await LiveSession.find({
      scheduledAt: { $gte: new Date() }
    }).sort({ scheduledAt: 1 });
    
    return NextResponse.json({ classes }, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch live classes" }, { status: 500 });
  }
}

// 2. CREATE A NEW CLASS (POST)
export async function POST(req: Request) {
  try {
    // A. Verify the user is logged in and is a tutor
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized. Only tutors can schedule classes." }, { status: 401 });
    }

    // B. Grab the form data
    const body = await req.json();
    const { topic, subject, scheduledAt, meetingLink } = body;

    await connectMongo();

    // C. Save to database WITH the required Tutor ID and Name!
    const newClass = await LiveSession.create({
      topic,
      subject,
      scheduledAt,
      meetingLink,
      tutorId: (session.user as any).id,          // Satisfies the 'tutorId' requirement
      tutorName: session.user?.name || "Tutor",   // Satisfies the 'tutorName' requirement
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to schedule class" }, { status: 500 });
  }
}