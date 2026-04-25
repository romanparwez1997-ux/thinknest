import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Initialize the AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    // 1. Security: Only let Tutors upload videos
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "tutor") {
      return NextResponse.json({ error: "Unauthorized. Tutors only." }, { status: 401 });
    }

    const { filename, contentType } = await req.json();

    // 2. Create a clean, unique file name to prevent overwriting
    const cleanFileName = filename.replace(/[^a-zA-Z0-9.]/g, "-").toLowerCase();
    const key = `courses/${Date.now()}-${cleanFileName}`;

    // 3. Tell AWS what we are about to upload
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    // 4. Get the secure, temporary upload URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    // 5. This is the permanent public URL where the video will live AFTER upload
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ presignedUrl, publicUrl }, { status: 200 });

  } catch (error) {
    console.error("AWS S3 Presign Error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}