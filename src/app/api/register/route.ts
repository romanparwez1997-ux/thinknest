import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';
import VerificationToken from '@/models/VerificationToken';

export async function POST(req: Request) {
  try {
    const { name, email, password, role, inviteCode, otp } = await req.json();

    if (!name || !email || !password || !role || !otp) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectMongo();

    // 🛑 1. DOUBLE-CHECK FOR DUPLICATE EMAIL
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered. Please log in." }, 
        { status: 400 }
      );
    }

    // 🛑 2. SECURE SERVER-SIDE TUTOR CODE VALIDATION
    if (role === 'tutor') {
      // We check the code they typed against the secure environment variable
      if (inviteCode !== process.env.TUTOR_SECRET_CODE) {
        return NextResponse.json(
          { error: "Invalid Tutor Invite Code. Please contact administration." }, 
          { status: 403 }
        );
      }
    }

    // 3. VERIFY THE OTP
    const validToken = await VerificationToken.findOne({
      email,
      code: otp,
      purpose: "signup"
    });

    if (!validToken) {
      return NextResponse.json({ error: "Invalid or expired OTP code." }, { status: 400 });
    }

    // 4. CLEAN UP USED OTP
    await VerificationToken.deleteOne({ _id: validToken._id });

    // 5. SECURE PASSWORD & HANDLE 30-DAY PROMO
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let isPremium = false;
    let premiumExpiresAt = null;

    if (role === 'student') {
      const studentCount = await User.countDocuments({ role: 'student' });
      if (studentCount < 100) {
        isPremium = true; 
        
        // 30 days from now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        premiumExpiresAt = thirtyDaysFromNow;
      }
    }

    // 6. CREATE THE USER
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isPremium,
      premiumExpiresAt 
    });

    return NextResponse.json(
      { message: "Account created successfully!", role: newUser.role }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Something went wrong during registration." }, { status: 500 });
  }
}