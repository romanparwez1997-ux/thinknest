import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectMongo from "@/lib/mongodb";
import TestAttempt from "@/models/TestAttempt";
import VideoProgress from "@/models/VideoProgess";
import LiveSession from "@/models/LiveSession"; 
import Link from "next/link";
import { PlayCircle, Trophy, Target, Clock, Flame, CheckCircle2, BookOpen, Radio, Calendar, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

// 🔥 THE FIX: The smart extractor that pulls the real URL out of a copied text block
const extractMeetingLink = (text: string) => {
  if (!text) return "#";

  // 1. Try to find a standard http:// or https:// link hidden anywhere in the text
  const urlRegex = /(https?:\/\/[^\s]+)/;
  const match = text.match(urlRegex);
  if (match) return match[0]; 

  // 2. If they forgot https://, scan for raw Google Meet links
  const meetRegex = /(meet\.google\.com\/[^\s]+)/;
  const meetMatch = text.match(meetRegex);
  if (meetMatch) return `https://${meetMatch[0]}`;

  // 3. Scan for raw Zoom links (e.g. us04web.zoom.us/j/...)
  const zoomRegex = /([a-zA-Z0-9-]+\.zoom\.us\/[^\s]+)/;
  const zoomMatch = text.match(zoomRegex);
  if (zoomMatch) return `https://${zoomMatch[0]}`;

  // 4. If it's just a single string without spaces, just slap https:// on it
  if (!text.trim().includes(" ")) {
    return `https://${text.trim()}`;
  }

  // Fallback if absolutely no link is found in the text
  return "#"; 
};

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "student") {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  await connectMongo();

  // 1. FETCH REAL TEST DATA
  const attempts = await TestAttempt.find({ studentId: userId })
    .sort({ createdAt: -1 })
    .populate({ path: 'testId', select: 'title' })
    .lean();

  const totalTestsTaken = attempts.length;
  let averageScore = 0;
  
  if (totalTestsTaken > 0) {
    const totalPercentage = attempts.reduce((acc: number, curr: any) => {
      return acc + (curr.score / curr.totalQuestions) * 100;
    }, 0);
    averageScore = Math.round(totalPercentage / totalTestsTaken);
  }

  const recentAttempts = attempts.slice(0, 3);

  // 2. FETCH REAL VIDEO PROGRESS DATA
  const allProgress = await VideoProgress.find({ studentId: userId }).lean();
  const totalSecondsWatched = allProgress.reduce((acc, curr) => acc + (curr.progressSeconds || 0), 0);
  const totalWatchMinutes = Math.floor(totalSecondsWatched / 60);
  const uniqueDays = new Set(allProgress.map(p => new Date(p.updatedAt).toLocaleDateString())).size;

  const recentVideoProgress = await VideoProgress.findOne({ studentId: userId })
    .sort({ updatedAt: -1 })
    .populate({ path: 'videoId', select: 'title subject videoUrl' })
    .lean();

  let continueWatching = null;
  if (recentVideoProgress && recentVideoProgress.videoId) {
    const video = recentVideoProgress.videoId as any;
    const totalSecs = recentVideoProgress.totalSeconds || 1; 
    const percentage = Math.min(100, Math.round((recentVideoProgress.progressSeconds / totalSecs) * 100));
    const secondsLeft = Math.max(0, totalSecs - recentVideoProgress.progressSeconds);
    const minsLeft = Math.ceil(secondsLeft / 60);

    continueWatching = {
      title: video.title,
      subject: video.subject,
      progressPercentage: percentage,
      timeLeft: `${minsLeft} mins left`,
      courseUrl: `/student/courses/${encodeURIComponent(video.subject)}` 
    };
  }

  // 3. FETCH UPCOMING LIVE SESSIONS
  const upcomingSessions = await LiveSession.find({
    scheduledAt: { $gte: new Date() }
  }).sort({ scheduledAt: 1 }).limit(2).lean();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {session.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Ready to crush your goals today?</p>
          </div>
          {(session.user as any).isPremium ? (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full font-bold shadow-sm self-start md:self-auto text-sm">
              <Trophy className="h-4 w-4" /> Premium Active
            </div>
          ) : (
            <Link href="/pricing" className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-2 rounded-full font-bold transition-colors self-start md:self-auto text-sm">
              Upgrade to Premium
            </Link>
          )}
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400 font-medium">
              <Target className="h-5 w-5 text-blue-500" /> Avg Score
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{averageScore}%</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400 font-medium">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> Tests Taken
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{totalTestsTaken}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400 font-medium">
              <Flame className="h-5 w-5 text-orange-500" /> Days Active
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{uniqueDays}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400 font-medium">
              <Clock className="h-5 w-5 text-purple-500" /> Time Watched
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{Math.floor(totalWatchMinutes / 60)}<span className="text-lg font-medium text-gray-500 ml-1">hrs</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* CONTINUE WATCHING CARD */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <PlayCircle className="h-6 w-6 text-blue-600 dark:text-blue-500" /> Continue Learning
                </h2>
                <Link href="/courses" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">View All</Link>
              </div>
              
              {continueWatching ? (
                <Link href={continueWatching.courseUrl} className="block bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="w-full md:w-48 h-28 bg-gray-100 dark:bg-gray-800 rounded-xl relative overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                      <PlayCircle className="h-10 w-10 text-gray-400 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                      <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                        {continueWatching.timeLeft}
                      </div>
                    </div>
                    <div className="flex-grow w-full">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md mb-2 inline-block">
                        {continueWatching.subject}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-1">
                        {continueWatching.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{continueWatching.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${continueWatching.progressPercentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to start learning?</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">You don't have any courses in progress right now. Pick a subject and jump in!</p>
                  <Link href="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors inline-block">
                    Browse Courses
                  </Link>
                </div>
              )}
            </div>

            {/* MILESTONE / LEARNING PATH */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Next Milestone: Test Master</h3>
                <p className="text-blue-100 mb-6 max-w-md">Complete {Math.max(0, 5 - totalTestsTaken)} more tests to unlock your first academic badge.</p>
                <div className="flex items-center gap-4">
                  <div className="flex-grow bg-black/20 rounded-full h-3">
                    <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalTestsTaken / 5) * 100)}%` }}></div>
                  </div>
                  <span className="font-bold">{totalTestsTaken} / 5 Tests</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* UPCOMING LIVE SESSIONS WIDGET */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Radio className="h-5 w-5 text-red-500" /> Live Classes
                </h2>
              </div>

              {upcomingSessions.length === 0 ? (
                <div className="text-center py-6">
                  <div className="bg-gray-50 dark:bg-gray-800 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming classes scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((liveSession: any) => (
                    <div key={liveSession._id.toString()} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-md mb-2 inline-block">
                        {liveSession.subject}
                      </span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                        {liveSession.topic || liveSession.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(liveSession.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      
                      {/* 🔥 THE FIX IS APPLIED RIGHT HERE 🔥 */}
                      <a 
                        href={extractMeetingLink(liveSession.meetingLink)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                      >
                        Join Class <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TEST HISTORY WIDGET */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Tests</h2>
                <Link href="/student/tests" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">All Tests</Link>
              </div>

              {recentAttempts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="bg-gray-50 dark:bg-gray-800 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">You haven't taken any tests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAttempts.map((attempt: any) => {
                    const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                    let colorClass = "text-green-600 bg-green-50 dark:bg-green-900/20";
                    if (percent < 70) colorClass = "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
                    if (percent < 50) colorClass = "text-red-600 bg-red-50 dark:bg-red-900/20";

                    return (
                      <Link href="/student/tests" key={attempt._id.toString()} className="group flex items-center justify-between p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 transition-all cursor-pointer">
                        <div className="flex-grow pr-3">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1">
                            {attempt.testId?.title || "Unknown Test"}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-lg font-bold text-xs flex-shrink-0 ${colorClass}`}>
                          {attempt.score}/{attempt.totalQuestions}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}