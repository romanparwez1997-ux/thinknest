import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import VideoProgress from "@/models/VideoProgess";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId, progressSeconds, totalSeconds } = await req.json();

    if (!videoId || progressSeconds === undefined || !totalSeconds) {
      return NextResponse.json({ error: "Missing required tracking data" }, { status: 400 });
    }

    await connectMongo();

    // Check if they watched at least 90% of the video to mark it "completed"
    const isCompleted = (progressSeconds / totalSeconds) >= 0.9;

    // The Upsert Magic
    await VideoProgress.findOneAndUpdate(
      { 
        studentId: (session.user as any).id, 
        videoId: videoId 
      },
      { 
        $set: { 
          progressSeconds: Math.floor(progressSeconds), 
          totalSeconds: Math.floor(totalSeconds),
          isCompleted 
        } 
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Progress Tracking Error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}