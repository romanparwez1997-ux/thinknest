import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Get the user's session token securely
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 2. ISOLATE PROTECTED ROUTES
  const isProtectedRoute = path.startsWith("/student") || path.startsWith("/tutor");

  // If they are not logged in and trying to access a dashboard, kick them to register/login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/register", req.url)); 
    // Note: If your login page is "/login", just change "/register" above!
  }

 
 // 3. ROLE-BASED SMART ROUTING
    if (token) {
      const isTutor = token.role === "tutor";
  
      // A. Prevent Students from sneaking into the Tutor area
      if (path.startsWith("/tutor") && !isTutor) {
        return NextResponse.redirect(new URL("/student/dashboard", req.url));
      }
  
      // B. THE FIX: Prevent Tutors from accessing ANY Student routes (including courses)
      if (path.startsWith("/student") && isTutor) {
        return NextResponse.redirect(new URL("/tutor/dashboard", req.url));
      }
    }

  // 4. THE PAYWALL (Only applies to Students viewing courses)
  if (path.startsWith("/student/courses") && token?.role !== "tutor") {
    // If they have paid, check if their 30-day pass has expired
    if (token?.isPremium && token?.premiumExpiresAt) {
      const expirationDate = new Date(token.premiumExpiresAt as string);
      const today = new Date();
      
      if (today > expirationDate) {
        // Pass is expired! Send them back to pricing.
        return NextResponse.redirect(new URL("/pricing?expired=true", req.url));
      }
    }
  }

  // If they pass all checks, let them in!
  return NextResponse.next();
}

// 5. THE MATCHER: Tell Next.js exactly which folders to protect
export const config = {
  matcher: [
    /*
     * Match all request paths inside these folders, including 
     * dynamic dynamic variables like [courseId]!
     */
    "/student/:path*",
    "/tutor/:path*",
  ],
};