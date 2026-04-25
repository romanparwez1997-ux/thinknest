import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // 1. Connect to the database
    await connectMongo();
    
    // 2. Get the data submitted from the frontend form
    const { name, email, password, role, inviteCode } = await req.json();

    // 3. Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // 4. Security Check: Block unauthorized tutor signups
    if (role === 'tutor') {
      const actualSecretCode = process.env.TUTOR_SECRET_CODE;
      if (inviteCode !== actualSecretCode) {
        return NextResponse.json({ error: "Invalid Tutor Invite Code" }, { status: 403 });
      }
    }

    // 5. Secure the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. The "First 100 Students" Logic!
    let isPremium = false;
    if (role === 'student') {
      const studentCount = await User.countDocuments({ role: 'student' });
      if (studentCount < 100) {
        isPremium = true; // Boom! Free premium access granted.
      }
    }

    // 7. Save the user to the database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isPremium
    });

    return NextResponse.json(
      { message: "Account created successfully!", isPremium: newUser.isPremium }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}