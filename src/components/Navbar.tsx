"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isTutor = (session?.user as any)?.role === "tutor";

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (session?.user) {
      const targetDashboard = isTutor ? '/tutor/dashboard' : '/student/dashboard';
      if (pathname === targetDashboard) {
        window.location.reload(); 
      } else {
        router.push(targetDashboard);
      }
    } else {
      if (pathname === '/') {
        window.location.reload(); 
      } else {
        router.push('/');
      }
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">ThinkNest</span>
          </button>

          {/* MIDDLE: Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-medium">
            <Link href="/courses" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Courses</Link>
            <Link href="/live-classes" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Live Classes</Link>
            
            {/* ONLY show Pricing if they are NOT a tutor */}
            {!isTutor && (
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Pricing</Link>
            )}
          </div>

          {/* RIGHT: Profile/Login (Theme Toggle Removed) */}
          <div className="hidden md:flex items-center gap-4">
            
            {status === "loading" ? (
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full"></div>
            ) : session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-full transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl py-2 border border-gray-100 dark:border-gray-800 transform opacity-100 scale-100 transition-all origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                        {isTutor ? 'Tutor' : 'Student'}
                      </span>
                    </div>
                    
                    <Link href={isTutor ? "/tutor/dashboard" : "/student/dashboard"} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <LayoutDashboard className="h-4 w-4 text-gray-400" /> Dashboard
                    </Link>
                    
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left border-t border-gray-100 dark:border-gray-800 mt-1">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2">Log in</Link>
                <Link href="/register" className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full transition-colors shadow-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}