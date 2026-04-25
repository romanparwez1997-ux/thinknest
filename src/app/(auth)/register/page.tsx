"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const inviteCode = formData.get('inviteCode') as string;

    // --- FRONTEND VALIDATION ---

    // 1. Check Password Length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    // 2. Check for Special Character using a Regular Expression
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(password)) {
      setError('Password must contain at least one special character (e.g., !@#$%).');
      setLoading(false);
      return;
    }

    // 3. Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, inviteCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      alert(`Success! ${data.isPremium ? "You got FREE Premium Access!" : ""}`);
      router.push('/login');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input id="name" name="name" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white sm:text-sm" placeholder="John Doe" />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white sm:text-sm" placeholder="you@example.com" />
            </div>

            {/* Main Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative mt-1">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white sm:text-sm pr-10" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
              <div className="relative mt-1">
                <input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white sm:text-sm pr-10" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-900 dark:text-gray-300">Student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value="tutor" checked={role === 'tutor'} onChange={() => setRole('tutor')} className="text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-900 dark:text-gray-300">Tutor</span>
                </label>
              </div>
            </div>

            {role === 'tutor' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg animate-in fade-in slide-in-from-top-2">
                <label htmlFor="inviteCode" className="block text-sm font-medium text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Tutor Invite Code
                </label>
                <input id="inviteCode" name="inviteCode" type="text" required={role === 'tutor'} className="mt-2 block w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white sm:text-sm" placeholder="Enter code" />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        
        <div className="text-center text-sm mt-4">
          <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Log in</Link>
        </div>
      </div>
    </div>
  );
}