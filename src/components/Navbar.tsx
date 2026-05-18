"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LogOut, LayoutDashboard, ChevronDown, Menu, X, Users } from 'lucide-react'; // Added Users icon

export default function Navbar() {
  const { data: session, status } = useSession();
  
  // Desktop Profile Dropdown State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  // Close desktop dropdown when clicking outside
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
    setIsMobileMenuOpen(false); 
    
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
            
            {!isTutor && (
              <>
                <Link href="/student/tests" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Mock Tests</Link>
                <Link href="/pricing" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Pricing</Link>
              </>
            )}
          </div>

          {/* RIGHT: Profile/Login & Mobile Toggle */}
          <div className="flex items-center gap-4">
            
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
                      
                      <Link 
                        href={isTutor ? "/tutor/dashboard" : "/student/dashboard"} 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-400" /> Dashboard
                      </Link>

                      {/* 🔥 NEW: Student List Link for Tutors (Desktop) */}
                      {isTutor && (
                        <Link 
                          href="/tutor/students" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Users className="h-4 w-4 text-blue-500" /> Student List
                        </Link>
                      )}
                      
                      <button 
                        onClick={() => signOut({ callbackUrl: '/' })} 
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left border-t border-gray-100 dark:border-gray-800 mt-1"
                      >
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-1 flex flex-col">
            <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Courses</Link>
            <Link href="/live-classes" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Live Classes</Link>
            
            {!isTutor && (
              <>
                <Link href="/student/tests" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Mock Tests</Link>
                <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Pricing</Link>
              </>
            )}

            {session?.user ? (
              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="px-3 pb-3">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{session.user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{session.user.email}</p>
                </div>
                <Link 
                  href={isTutor ? "/tutor/dashboard" : "/student/dashboard"} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 text-gray-400" /> Dashboard
                </Link>

                {/* 🔥 NEW: Student List Link for Tutors (Mobile) */}
                {isTutor && (
                  <Link 
                    href="/admin/students" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <Users className="h-5 w-5 text-blue-500" /> Student List
                  </Link>
                )}

                <button 
                  onClick={() => { setIsMobileMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                >
                  <LogOut className="h-5 w-5" /> Sign out
                </button>
              </div>
            ) : (
              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3 px-3">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center text-gray-800 dark:text-gray-200 font-bold py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Log in</Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}