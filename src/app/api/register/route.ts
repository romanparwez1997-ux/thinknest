import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken"; // The OTP Vault

export async function POST(req: Request) {
  try {
    await connectMongo();
    
    // Grab all the data, including the OTP and inviteCode
    const { name, email, password, role, inviteCode, otp } = await req.json();

    // 1. VERIFY THE OTP FIRST
    const validToken = await VerificationToken.findOne({ email, code: otp, purpose: 'signup' });
    if (!validToken) {
      return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
    }

    // 2. CHECK IF USER ALREADY EXISTS
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // 3. SECURE TUTOR SIGNUPS
    if (role === 'tutor') {
      const actualSecretCode = process.env.TUTOR_SECRET_CODE;
      if (inviteCode !== actualSecretCode) {
        return NextResponse.json({ error: "Invalid Tutor Invite Code" }, { status: 403 });
      }
    }

   // 4. SECURE PASSWORD & HANDLE PREMIUM PROMO
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let isPremium = false;
    let premiumExpiresAt = null; // Prepare the timer variable

    if (role === 'student') {
      const studentCount = await User.countDocuments({ role: 'student' });
      if (studentCount < 100) {
        isPremium = true; 
        
        // BOOM: Set the expiration date to exactly 30 days from right now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        premiumExpiresAt = thirtyDaysFromNow;
      }
    }

    // 5. CREATE THE USER
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isPremium,
      premiumExpiresAt
    });

    // 6. CLEAN UP: Delete the OTP so it can't be used again
    await VerificationToken.deleteOne({ _id: validToken._id });

    return NextResponse.json(
      { message: "Account created successfully!", isPremium: newUser.isPremium }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}