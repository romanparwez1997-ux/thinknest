import connectMongo from "@/lib/mongodb";
import Test from "@/models/Test";
import Link from "next/link";
import { Clock, FileText, PlayCircle } from "lucide-react";

export const dynamic = "force-dynamic"; // Ensures it always fetches fresh tests

export default async function MockTestsList() {
  await connectMongo();
  
  // Fetch all tests, but we only need the title, duration, and question count
  const tests = await Test.find({}).select("title durationMinutes questions").lean();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Available Mock Tests</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Test your knowledge and prepare for your exams.</p>

        {tests.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No tests available yet</h3>
            <p className="text-gray-500">Check back later when tutors have uploaded new mock tests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test: any) => (
              <div key={test._id.toString()} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">
                  {test.title}
                </h2>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {test.durationMinutes} mins
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> {test.questions.length} Questions
                  </div>
                </div>

                <Link 
                  href={`/student/test/${test._id}`}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors"
                >
                  Start Test <PlayCircle className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}