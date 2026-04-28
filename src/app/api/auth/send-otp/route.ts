import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import VerificationToken from "@/models/VerificationToken";
import { sendEmail } from "@/lib/mail";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, purpose } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: "Email and purpose are required." }, { status: 400 });
    }

    await connectMongo();

    // 🛑 CONDITIONAL USER CHECKS based on purpose
    const existingUser = await User.findOne({ email });

    // If they are signing up, block duplicates
    if (purpose === "signup" && existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 400 }
      );
    }

    // If they are logging in, block non-existent users
    if (purpose === "2fa" && !existingUser) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up." },
        { status: 400 }
      );
    }

    // 1. Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Delete any existing codes for this email and purpose so they don't pile up
    await VerificationToken.deleteMany({ email, purpose });

    // 3. Save to database with a 10-minute expiration
    await VerificationToken.create({
      email,
      code, // Fixed variable name mismatch
      purpose, // Use dynamic purpose ("signup" or "2fa")
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