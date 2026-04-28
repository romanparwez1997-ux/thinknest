import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import LiveSession from "@/models/LiveSession"; 

export async function DELETE(
  req: Request,
  // 1. Tell TypeScript that params is now a Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    // 2. THE MAGIC FIX: "await" the params before you try to read the ID!
    const { id } = await params; 

    await connectMongo();

    // 3. Now use that resolved 'id' safely
    const deletedClass = await LiveSession.findByIdAndDelete(id);

    if (!deletedClass) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Class cancelled successfully." }, { status: 200 });

  } catch (error) {
    console.error("Error cancelling class:", error);
    return NextResponse.json({ error: "Failed to cancel class." }, { status: 500 });
  }
}

// 1. FETCH CLASSES (GET)
export async function GET() {
  try {
    await connectMongo();
    
    // THE FIX: Fetch ALL classes, we will sort them on the frontend!
    const classes = await LiveSession.find().sort({ scheduledAt: -1 }); 
    
    return NextResponse.json({ classes }, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch live classes" }, { status: 500 });
  }
}


// ... existing imports and DELETE function ...

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { recordingUrl } = body;

    await connectMongo();

    // Find the class and update it to "Completed" with the new video URL
    const updatedClass = await LiveSession.findByIdAndUpdate(
      id,
      { 
        isCompleted: true,
        recordingUrl: recordingUrl 
      },
      { new: true } // Returns the updated document
    );

    if (!updatedClass) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Recording saved successfully!", class: updatedClass }, { status: 200 });

  } catch (error) {
    console.error("Error saving recording:", error);
    return NextResponse.json({ error: "Failed to save recording." }, { status: 500 });
  }
}