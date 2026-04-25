import { NextResponse } from "next/server";
import crypto from "crypto";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Calculate exactly 30 days from exactly right now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Update the user in MongoDB
    await User.findByIdAndUpdate((session.user as any).id, {
      isPremium: true,
      premiumExpiresAt: expirationDate, // Set the timer!
    });

    // 1. Recreate the signature using your secret key
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    // 2. Check if it matches what Razorpay sent
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: "Invalid Payment Signature" }, { status: 400 });
    }

    // 3. SUCCESS! Upgrade the student to Premium
    await connectMongo();
    await User.findByIdAndUpdate((session.user as any).id, { isPremium: true });

    return NextResponse.json({ message: "Payment verified successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Server error during verification" }, { status: 500 });
  }
}