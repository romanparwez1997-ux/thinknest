import Link from 'next/link';
import { Star, PlayCircle, AlertCircle, Calendar, Clock } from 'lucide-react';
import connectMongo from '@/lib/mongodb';
import Video from '@/models/Video';
// Make sure to import whatever model you use for upcoming classes/courses!
// import Course from '@/models/Course'; 

export const revalidate = 60; 

export default async function PublicCoursesPage() {
  await connectMongo();

  // 1. DYNAMIC AVAILABLE COURSES: Group videos by subject
  const subjectCounts = await Video.aggregate([
    { $group: { _id: "$subject", count: { $sum: 1 } } },
    { $sort: { _id: 1 } } // Sort alphabetically
  ]);

  // A beautiful palette of colors. The system will automatically cycle through these
  // for any new subject a tutor uploads. Zero hardcoding required.
  const colorPalette = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0891b2", "#e11d48", "#ca8a04"];

  const dynamicCatalogs = subjectCounts.map((s, index) => ({
    subject: s._id || "General",
    title: `${s._id || "General"} Masterclass`, // Auto-generates "Physics Masterclass", etc.
    videos: s.count,
    colorHex: colorPalette[index % colorPalette.length], 
    target: "Premium Content",
  }));

  // 2. UPCOMING COURSES: Fetch from your database where launch date is in the future
  // Note: Adapt this query to match your actual database schema!
  let upcomingCourses: any[] = [];
  try {
    /* Example query if you have a Course model:
    upcomingCourses = await Course.find({ 
      status: 'upcoming', 
      launchDate: { $gt: new Date() } 
    }).sort({ launchDate: 1 }).limit(3);
    */
   
    // For now, this is an empty array. Once you hook up your DB model above, 
    // it will automatically populate the UI below!
    upcomingCourses = []; 
  } catch (error) {
    console.error("Failed to fetch upcoming courses");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Explore Our Premium <span className="text-blue-600">Courses</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Comprehensive video lectures, mock tests, and top-tier faculty.
        </p>
      </div>

      {/* --- SECTION 1: UPCOMING COURSES --- */}
      {upcomingCourses.length > 0 && (
        <div className="mb-20">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 dark:text-white">
            <Calendar className="text-orange-500" /> Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingCourses.map((course, idx) => (
              <div key={idx} className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                  Upcoming
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 pr-8">{course.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                <div className="mt-auto flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                  <Clock className="h-4 w-4" /> 
                  <span>Launches on {new Date(course.launchDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 2: AVAILABLE COURSES --- */}
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 dark:text-white">
        <PlayCircle className="text-blue-600" /> Available Now
      </h2>

      {dynamicCatalogs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">New courses dropping soon!</h2>
          <p className="text-gray-500 dark:text-gray-400">Our tutors are currently recording fresh premium content.</p>
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
                  <div className="flex items-center gap-1">
                    <PlayCircle className="h-4 w-4 text-blue-500" />
                    <span>{course.videos} Lectures</span>
                  </div>
                </div>

                <Link 
                  href={`/student/courses/${encodeURIComponent(course.subject)}`} 
                  className="mt-auto block w-full text-center bg-gray-50 dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500"
                >
                  Start Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}