import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const amount = 999 * 100; // ₹4,999 in paise

    // SHORTENED RECEIPT: Guaranteed to be under 40 characters
    const shortReceipt = `rcpt_${Date.now().toString().slice(-6)}`;

    // Create the secure order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: shortReceipt,
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount }, { status: 200 });

  } catch (error: any) {
    // This will print the EXACT Razorpay error in your VS Code terminal
    console.error("Razorpay Order Error Details:", error); 
    
    return NextResponse.json(
      { error: "Failed to create order. Check server console." }, 
      { status: 500 }
    );
  }
}