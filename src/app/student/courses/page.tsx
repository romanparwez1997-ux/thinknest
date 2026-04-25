import Link from 'next/link';
import { BookOpen, PlayCircle, Clock, Star } from 'lucide-react';

export default function CoursesPage() {
  // Dummy data for our frontend UI. Later, we will fetch this from MongoDB!
  const courses = [
    { id: "jee-physics-11", title: "JEE Physics - Class 11", tutor: "H.C. Verma", videos: 45, duration: "32h", color: "bg-blue-500" },
    { id: "neet-biology-12", title: "NEET Biology - Class 12", tutor: "Dr. Ali", videos: 60, duration: "40h", color: "bg-green-500" },
    { id: "jee-math-12", title: "JEE Advanced Math", tutor: "R.D. Sharma", videos: 55, duration: "38h", color: "bg-indigo-500" },
    { id: "board-chem-11", title: "CBSE Chemistry - Class 11", tutor: "O.P. Tandon", videos: 30, duration: "20h", color: "bg-orange-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <Link href={`/student/courses/${course.id}`} key={course.id} className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all overflow-hidden">
            {/* Course Thumbnail */}
            <div className={`h-32 ${course.color} relative p-4 flex flex-col justify-end`}>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <h3 className="relative text-white font-bold text-lg z-10 leading-tight">{course.title}</h3>
            </div>
            
            {/* Course Details */}
            <div className="p-4 flex flex-col flex-grow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">By {course.tutor}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-auto">
                <div className="flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" />
                  <span>{course.videos} Lectures</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Progress Bar (Fake for now) */}
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-4">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}