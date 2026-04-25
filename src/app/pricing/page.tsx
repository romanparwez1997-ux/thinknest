"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Script from "next/script";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!session) {
      alert("Please log in to purchase a course.");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      // 1. Ask backend for the secure Order ID
      const res = await fetch("/api/payment/order", { method: "POST" });
      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.error);

      // 2. Configure the Razorpay Popup Window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: "INR",
        name: "EduPro Masterclass",
        description: "Complete JEE & NEET Prep",
        order_id: orderData.orderId,
        
        // 3. What to do when payment succeeds
        handler: async function (response: any) {
          // Send the signature to our verify API
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (verifyRes.ok) {
            alert("Payment Successful! Welcome to Premium.");
            router.push("/student/dashboard");
            router.refresh(); 
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#2563EB", // Matches your Tailwind blue-600
        },
      };

      // 4. Open the modal!
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert("Something went wrong loading the payment gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Securely loads the Razorpay SDK into your app */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Unlock Your True Potential
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Get unlimited access to all live classes, premium recorded lectures, and mock tests.
        </p>

        <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900 rounded-3xl p-8 max-w-md mx-auto shadow-xl">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Premium Plan</h2>
          <div className="text-5xl font-extrabold mb-6 text-blue-600 dark:text-blue-500">
            ₹999<span className="text-lg text-gray-500 dark:text-gray-400 font-medium">/month</span>
          </div>
          
          <ul className="space-y-4 mb-8 text-left">
            <FeatureItem text="Daily Live PCM/PCB Classes" />
            <FeatureItem text="Access to all Pre-recorded content" />
            <FeatureItem text="Weekly Mock Tests & Analytics" />
            <FeatureItem text="1-on-1 Doubt Clearing Sessions" />
          </ul>

          <button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70"
          >
            {loading ? "Loading Gateway..." : "Enroll Now"}
          </button>
        </div>
      </div>
    </>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );
}