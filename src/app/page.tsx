import Link from 'next/link';
import { PlayCircle, Star } from 'lucide-react';
import connectMongo from '@/lib/mongodb';
import Video from '@/models/Video';
import { getServerSession } from "next-auth";
// Adjust this import path if your authOptions is located elsewhere!
import { authOptions } from "./api/auth/[...nextauth]/route"; 

// Refresh the homepage data every 60 seconds
export const revalidate = 60; 

export default async function HomePage() {
  // 1. Check if the user is already logged in
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // 2. Determine the correct Call-To-Action (CTA) button
  let ctaLink = "/register";
  let ctaText = "Start Learning Now";

  if (user) {
    // If logged in, send them to their specific dashboard
    ctaLink = user.role === 'tutor' ? "/tutor/dashboard" : "/student/dashboard";
    ctaText = "Go to Dashboard";
  }

  // 3. Fetch real database subjects
  await connectMongo();
  const subjectCounts = await Video.aggregate([
    { $group: { _id: "$subject", count: { $sum: 1 } } }
  ]);

  const getCourseDetails = (subject: string, count: number) => {
    const details: Record<string, any> = {
      Physics: { title: "Mastering Physics", target: "JEE/NEET Core", colorHex: "#2563eb", rating: "4.9" },
      Chemistry: { title: "Complete Chemistry", target: "JEE/NEET Core", colorHex: "#16a34a", rating: "4.8" },
      Math: { title: "Advanced Mathematics", target: "JEE Mains & Adv", colorHex: "#9333ea", rating: "4.9" },
      Biology: { title: "NEET Biology Masterclass", target: "Medical Entrance", colorHex: "#ea580c", rating: "5.0" },
    };
    const defaultDetails = { title: `${subject} Fundamentals`, target: "All Students", colorHex: "#475569", rating: "4.5" };
    return { ...(details[subject] || defaultDetails), videos: count, subject };
  };

  const dynamicCatalogs = subjectCounts.map(s => getCourseDetails(s._id, s.count));

  return (
    <div className="flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
          Crack India's Toughest Exams with <span className="text-blue-600">ThinkNest</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
          Premium video lectures, live doubt-clearing, and expert faculty. Join thousands of students already learning on our platform.
        </p>
        <div className="flex justify-center gap-4">
          {/* THE FIX: The dynamic CTA button */}
          <Link href={ctaLink} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg shadow-blue-500/30">
            {ctaText}
          </Link>
          <Link href="/courses" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-8 rounded-full border border-gray-200 dark:border-gray-700 transition-colors">
            View Syllabus
          </Link>
        </div>
      </section>

      {/* Dynamic Courses Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Explore Our Premium <span className="text-blue-600">Courses</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            These subjects are automatically generated based on our tutors' latest uploads.
          </p>
        </div>

        {dynamicCatalogs.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Content dropping soon!</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dynamicCatalogs.map((course) => (
              <div key={course.subject} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col hover:shadow-xl dark:hover:border-gray-700 transition-all">
                <div style={{ backgroundColor: course.colorHex }} className="h-40 relative p-6 flex flex-col justify-end">
                  <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold">
                    {course.target}
                  </div>
                  <h3 className="relative text-white font-bold text-xl z-10 leading-tight">{course.title}</h3>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-1"><PlayCircle className="h-4 w-4 text-blue-500" /> <span>{course.videos} Lectures</span></div>
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-current" /> <span>{course.rating}</span></div>
                  </div>
                  <Link href="/pricing" className="mt-auto block w-full text-center bg-gray-50 dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors border border-gray-200 dark:border-gray-700">
                    Unlock Access
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}