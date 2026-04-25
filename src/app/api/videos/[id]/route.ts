import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Video from "@/models/Video";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // 1. Tell TypeScript it's a Promise
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Security check: Must be a logged-in tutor
    if (!session || (session.user as any).role !== 'tutor') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. AWAIT THE PARAMS HERE!
    const { id } = await params;

    await connectMongo();

    // Find the video using the unwrapped 'id'
    const video = await Video.findOne({ _id: id, tutorId: (session.user as any).id });

    if (!video) {
      return NextResponse.json({ error: "Video not found or you do not have permission" }, { status: 404 });
    }

    // Delete it from the MongoDB database
    await Video.findByIdAndDelete(id);

    return NextResponse.json({ message: "Video deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}