import Link from 'next/link';
import { Calendar, Video, Clock, Users, Lock, AlertCircle } from 'lucide-react';
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import LiveSession from "@/models/LiveSession";
import { extractMeetingLink } from '@/lib/formatters';

export const revalidate = 0; // Forces Next.js to never cache this page so the schedule is always accurate

export default async function LiveClassesPage() {
  const session = await getServerSession(authOptions);
  const isPremium = (session?.user as any)?.isPremium;

  // Fetch only upcoming classes from MongoDB, sorted by soonest first
  await connectMongo();
  const now = new Date();
  const schedule = await LiveSession.find({ scheduledAt: { $gte: now } })
    .sort({ scheduledAt: 1 })
    .lean();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Upcoming <span className="text-red-500">Live</span> Classes
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Interact directly with expert faculty, ask doubts in real-time, and master complex concepts.
        </p>
      </div>

      <div className="space-y-6">
        {schedule.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No live classes scheduled right now</h2>
            <p className="text-gray-500 dark:text-gray-400">Our tutors will post the next schedule soon. Stay tuned!</p>
          </div>
        ) : (
          schedule.map((sessionItem: any) => (
            <div key={sessionItem._id.toString()} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              
              <div className="flex-grow text-center md:text-left">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                  {sessionItem.subject}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3 mb-2">{sessionItem.topic}</h3>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> 
                    {new Date(sessionItem.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <span className="flex items-center gap-1"><Video className="h-4 w-4" /> By {sessionItem.tutorName}</span>
                </div>
              </div>

              <div className="w-full md:w-auto flex-shrink-0">
                {isPremium ? (
                  
                  <a href={extractMeetingLink(sessionItem.meetingLink)} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2">
                    <Video className="h-5 w-5" /> Join Stream
                  </a>
                ) : (
                  <Link href="/pricing" className="w-full md:w-auto bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700">
                    <Lock className="h-4 w-4" /> Premium Only
                  </Link>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}