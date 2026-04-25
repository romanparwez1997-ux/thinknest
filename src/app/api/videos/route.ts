import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    // 1. Ensure the user is logged in AND is a tutor
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'tutor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the video details from the frontend
    const { title, subject, videoUrl } = await req.json();

    if (!title || !subject || !videoUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Save it to MongoDB
    await connectMongo();
    const newVideo = await Video.create({
      title,
      subject,
      videoUrl,
      tutorId: (session.user as any).id, 
    });

    return NextResponse.json({ message: "Video saved successfully!", video: newVideo }, { status: 201 });

  } catch (error) {
    console.error("Error saving video:", error);
    return NextResponse.json({ error: "Failed to save video to database" }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    await connectMongo();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check if the frontend is asking for a specific subject
    const { searchParams } = new URL(req.url);
    const subjectParam = searchParams.get('subject');

    let query: any = {};
    
    // 2. If it's a tutor, only show THEIR videos
    if ((session.user as any).role === 'tutor') {
      query.tutorId = (session.user as any).id;
    }
    
    // 3. If a subject was requested (e.g., ?subject=Physics), filter by it!
    if (subjectParam) {
      query.subject = subjectParam;
    }

    // Fetch the videos and sort by oldest first (so Lecture 1 is at the top of the playlist)
    const videos = await Video.find(query).sort({ createdAt: 1 });

    return NextResponse.json({ videos }, { status: 200 });

  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}