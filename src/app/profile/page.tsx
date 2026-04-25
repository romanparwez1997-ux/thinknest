"use client";

import { useSession, signOut } from "next-auth/react";
import { User, Mail, Shield, Star, LogOut, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading profile...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:text-white">
        <p className="mb-4">You must be logged in to view this page.</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Log In</Link>
      </div>
    );
  }

  const user = session.user as any;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-blue-600 dark:text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Header Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 border-b border-gray-200 dark:border-gray-800 flex items-center gap-6">
          <div className="h-24 w-24 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-4xl font-bold uppercase">
            {user.name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              <Shield className="h-3 w-3" /> {user.role}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                <User className="h-4 w-4" /> Full Name
              </p>
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </p>
              <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>

            {/* Premium Status Card (Only relevant for students) */}
            {user.role === 'student' && (
              <div className={`col-span-1 md:col-span-2 p-6 rounded-xl border ${user.isPremium ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/10' : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/10'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold mb-1 flex items-center gap-2 ${user.isPremium ? 'text-green-600 dark:text-green-500' : 'text-blue-600 dark:text-blue-500'}`}>
                      <Star className="h-4 w-4" /> Subscription Status
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user.isPremium ? "Active Premium Member" : "Free Tier"}
                    </p>
                  </div>
                  {!user.isPremium && (
                    <Link href="/pricing" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                      Upgrade Now
                    </Link>
                  )}
                </div>
              </div>
            )}

          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-end">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" /> Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}