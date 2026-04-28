"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [inviteCode, setInviteCode] = useState(''); // NEW: State for the tutor code
  const [otp, setOtp] = useState('');

  // Step 1: Send the Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'signup' }),
      });

      if (res.ok) {
        setStep(2); // Move to OTP screen
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send code.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Create Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        
        // WE SEND EVERYTHING TO THE BACKEND HERE:
        body: JSON.stringify({ name, email, password, role, inviteCode, otp }), 
      });

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        const data = await res.json();
        // Show the specific error (e.g., "Invalid Tutor Code" or "Wrong OTP")
        setError(data.error || "Failed to create account."); 
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8">
          {step === 1 ? "Join ThinkNest" : "Check Your Email"}
        </h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I am a...</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white">
                <option value="student">Student</option>
                <option value="tutor">Tutor</option>
              </select>
            </div>

            {/* DYNAMIC UI: Only show this if they selected 'tutor' */}
            {role === 'tutor' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Tutor Invite Code</label>
                <input 
                  type="text" 
                  required 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value)} 
                  placeholder="Enter secret code"
                  className="w-full px-4 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-blue-500" 
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? "Sending Code..." : "Continue"}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">We sent a 6-digit code to <strong>{email}</strong>.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Code</label>
              <input type="text" required maxLength={6} placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center tracking-widest text-2xl font-bold px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? "Verifying..." : "Create Account"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Back</button>
          </form>
        )}
      </div>
    </div>
  );
}