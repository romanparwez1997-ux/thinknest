"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Step 1: Enter Credentials and Request 2FA Code
  const handleRequest2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send the 2FA code to their email
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: '2fa' }),
      });

      if (res.ok) {
        setStep(2); // Flip to OTP screen
      } else {
        setError("Failed to send 2FA code. Check your email address.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Credentials + OTP to NextAuth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // NextAuth handles the final check of everything
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      otp, // Pass the OTP to NextAuth
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/student/dashboard'); // Middleware will auto-route Tutors correctly!
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8">
          {step === 1 ? "Welcome Back" : "Two-Factor Auth"}
        </h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequest2FA} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? "Securing Login..." : "Login"}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">New here? <Link href="/register" className="text-blue-600 font-bold hover:underline">Sign up</Link></p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">Enter the 6-digit code sent to your email to continue.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Login Code</label>
              <input type="text" required maxLength={6} placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center tracking-widest text-2xl font-bold px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? "Authenticating..." : "Verify & Login"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Back to Password</button>
          </form>
        )}
      </div>
    </div>
  );
}