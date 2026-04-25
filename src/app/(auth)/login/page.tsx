"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      // Call NextAuth signIn
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Success! The easiest way to route them correctly is to reload the page 
        // or push them to a middleware-protected route. 
        // For now, let's fetch their session dynamically and route them:
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        
        if (sessionData?.user?.role === 'tutor') {
          router.push('/tutor/dashboard');
        } else {
          router.push('/student/dashboard');
        }
        router.refresh(); // Refresh the navbar state
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Log in to continue your learning journey.</p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <input id="email" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white sm:text-sm" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative mt-1">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white sm:text-sm pr-10" 
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
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        
        <div className="text-center text-sm mt-4">
          <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">Sign up</Link>
        </div>
      </div>
    </div>
  );
}