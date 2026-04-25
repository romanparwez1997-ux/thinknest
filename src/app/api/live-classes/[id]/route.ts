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