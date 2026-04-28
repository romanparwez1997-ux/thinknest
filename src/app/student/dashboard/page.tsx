"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PlayCircle, Clock, BookOpen, Lock, Unlock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { data: session } = useSession();
  
  // ALL State declarations must be at the top!
  const [groupedVideos, setGroupedVideos] = useState<Record<string, any[]>>({});
  const [totalLectures, setTotalLectures] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for Tabs and Recordings
  const [activeTab, setActiveTab] = useState<'courses' | 'archives'>('courses');
  const [recordings, setRecordings] = useState<any[]>([]);

  const user = session?.user as any;
  const isPremium = user?.isPremium;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Pre-Recorded Videos
        const videoRes = await fetch(`/api/videos?timestamp=${Date.now()}`, { cache: 'no-store' });
        const videoData = await videoRes.json();
        
        if (videoRes.ok) {
          const videos = videoData.videos;
          setTotalLectures(videos.length);
          
          // Group videos by Subject
          const grouped = videos.reduce((acc: any, video: any) => {
            const subject = video.subject || "General";
            if (!acc[subject]) acc[subject] = [];
            acc[subject].push(video);
            return acc;
          }, {});
          
          setGroupedVideos(grouped);
        }

        // 2. Fetch Live Classes (Recordings)
        const liveRes = await fetch(`/api/live-classes?timestamp=${Date.now()}`, { cache: 'no-store' });
        const liveData = await liveRes.json();
        
        if (liveRes.ok) {
          // Only keep classes that have a recording URL attached by the tutor!
          setRecordings(liveData.classes.filter((c: any) => c.recordingUrl));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Pick up exactly where you left off.</p>
        </div>
        
        {/* Dynamic Premium Status Badge */}
        <Link 
          href={isPremium ? "#" : "/pricing"}
          className={`px-4 py-2 rounded-xl border font-bold flex items-center gap-2 transition-transform hover:scale-105 ${isPremium ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 shadow-sm cursor-pointer'}`}
        >
          {isPremium ? <><Unlock className="h-4 w-4"/> Premium Active</> : <><Lock className="h-4 w-4"/> Upgrade to Premium</>}
        </Link>
      </div>

      {/* REAL Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl"><BookOpen className="text-blue-600 dark:text-blue-400 h-6 w-6"/></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Available Subjects</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(groupedVideos).length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl"><PlayCircle className="text-orange-600 dark:text-orange-400 h-6 w-6"/></div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Video Lectures</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLectures}</p>
          </div>
        </div>

        {!isPremium && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-950 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-300 font-medium flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-400"/> Limited Access</p>
              <p className="text-lg font-bold text-white mt-1">Unlock all content</p>
            </div>
            <Link href="/pricing" className="bg-white text-gray-900 text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Upgrade
            </Link>
          </div>
        )}
      </div>

      {/* --- TABS NAVIGATION --- */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-8">
        <button 
          onClick={() => setActiveTab('courses')}
          className={`pb-4 px-2 font-bold transition-colors border-b-2 text-lg ${activeTab === 'courses' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Pre-Recorded Courses
        </button>
        <button 
          onClick={() => setActiveTab('archives')}
          className={`pb-4 px-2 font-bold transition-colors border-b-2 text-lg flex items-center gap-2 ${activeTab === 'archives' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          Live Class Archives {!isPremium && <Lock className="h-4 w-4" />}
        </button>
      </div>

      {/* --- RENDER CONTENT BASED ON ACTIVE TAB --- */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading your personalized curriculum...</div>
      ) : activeTab === 'courses' ? (
        
        // ==========================================
        // TAB 1: PRE-RECORDED COURSES
        // ==========================================
        totalLectures === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            No pre-recorded classes available yet.
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedVideos).map(([subject, videos]) => (
              <div key={subject}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    {subject} <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{videos.length} Lectures</span>
                  </h2>
                  <Link href={`/student/courses/${subject}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    View All →
                  </Link>
                </div>

                <div className="flex overflow-x-auto pb-4 gap-6 snap-x hide-scrollbar">
                  {videos.map((video) => (
                    <Link 
                      href={`/student/courses/${encodeURIComponent(video.subject)}`} 
                      key={video._id}
                      className="snap-start flex-shrink-0 w-72 sm:w-80 group flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl transition-all overflow-hidden"
                    >
                      <div className="aspect-video bg-black relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <PlayCircle className="text-white h-12 w-12" />
                        </div>
                        {!isPremium && (
                          <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 border border-gray-600">
                            <Unlock className="h-3 w-3 text-green-400" /> Free Preview
                          </div>
                        )}
                        <video src={video.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" preload="metadata"></video>
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {video.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between text-xs font-medium">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(video.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded-md flex items-center gap-1 ${isPremium ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' : 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800'}`}>
                            {isPremium ? 'Watch Full' : 'Watch Preview'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      ) : (

        // ==========================================
        // TAB 2: LIVE ARCHIVES (PREMIUM ONLY)
        // ==========================================
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isPremium ? (
            
            // THE PAYWALL LOCK
            <div className="col-span-full bg-gradient-to-br from-gray-900 to-black rounded-2xl p-12 text-center border border-gray-800 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <Lock className="h-16 w-16 text-blue-500 mx-auto mb-6 drop-shadow-lg" />
              <h2 className="text-2xl font-extrabold text-white mb-4 z-10 relative">Premium Feature Locked</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8 z-10 relative">
                Missed a live class? Upgrade to Premium to unlock our entire vault of recorded live sessions and masterclasses.
              </p>
              <Link href="/pricing" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-transform hover:scale-105 z-10 relative shadow-xl">
                Unlock Archives
              </Link>
            </div>

          ) : recordings.length === 0 ? (
            
            // EMPTY STATE FOR PREMIUM USERS
            <div className="col-span-full text-center py-12 text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              No live class recordings available yet.
            </div>

          ) : (
            
            // ACTUAL RECORDINGS FOR PREMIUM USERS
            recordings.map((rec) => (
              <div key={rec._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                <div className="aspect-video bg-gray-900 relative flex items-center justify-center group">
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                   <PlayCircle className="text-white h-12 w-12 z-20 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                   <div className="absolute bottom-2 right-2 bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded z-20">Recorded</div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">{rec.subject}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">{rec.topic}</h3>
                  
                  <a href={rec.recordingUrl} target="_blank" rel="noopener noreferrer" className="mt-auto block w-full text-center bg-gray-50 dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-900 dark:text-white text-sm font-bold py-2.5 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 hover:border-blue-600">
                    Watch Recording
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}