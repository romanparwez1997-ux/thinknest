import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import VerificationToken from "@/models/VerificationToken";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, purpose } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: "Email and purpose are required." }, { status: 400 });
    }

    // 1. Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await connectMongo();

    // 2. Delete any existing codes for this email so they don't pile up
    await VerificationToken.deleteMany({ email, purpose });

    // 3. Save the new code to our Vault (expires in 10 mins automatically)
    await VerificationToken.create({
      email,
      code,
      purpose,
    });

    // 4. Send the email
    const subject = purpose === "signup" ? "ThinkNest: Verify your email" : "ThinkNest: Your 2FA Login Code";
    const message = `Your ThinkNest verification code is: ${code}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.`;
    
    await sendEmail(email, subject, message);

    return NextResponse.json({ message: "OTP sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}