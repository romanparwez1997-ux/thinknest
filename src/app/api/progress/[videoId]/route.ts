import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import VideoProgress from "@/models/VideoProgess";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: { videoId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const progress = await VideoProgress.findOne({
      studentId: (session.user as any).id,
      videoId: params.videoId
    });

    // If no progress is found, return 0
    return NextResponse.json({ progressSeconds: progress?.progressSeconds || 0 }, { status: 200 });

  } catch (error) {
    console.error("Fetch Progress Error:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}