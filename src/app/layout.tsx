import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// 1. Bring the ThemeProvider back
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ThinkNest | Premium Learning",
  description: "Crack JEE and NEET with expert tutors on ThinkNest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-black text-gray-900 dark:text-white min-h-screen flex flex-col`}>
        <AuthProvider>
          
          {/* 2. THE MAGIC FIX: Force the theme to be dark permanently */}
          <ThemeProvider attribute="class" forcedTheme="dark">
            <Navbar />
            
            <main className="flex-grow">
              {children}
            </main>

            <Footer />
          </ThemeProvider>

        </AuthProvider>
      </body>
    </html>
  );
}