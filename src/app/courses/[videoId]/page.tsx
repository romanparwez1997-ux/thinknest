"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Lock, PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SecureVideoPlayer from '@/components/SecureVideoPlayer';

export default function CoursePlayerPage() {
  const { data: session } = useSession();
  const params = useParams();
  
  const subjectName = decodeURIComponent(params.courseId as string);
  
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  
  // New States for Progress Tracking
  const [loading, setLoading] = useState(true);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [fetchingProgress, setFetchingProgress] = useState(false);

  const isPremium = (session?.user as any)?.isPremium;

  // 1. Fetch the Playlist
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`/api/videos?timestamp=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) {
          const subjectVideos = data.videos.filter((v: any) => v.subject === subjectName);
          setVideos(subjectVideos);
          if (subjectVideos.length > 0) setActiveVideo(subjectVideos[0]);
        }
      } catch (error) {
        console.error("Failed to fetch videos");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [subjectName]);

  // 2. Fetch their specific progress whenever the Active Video changes
  useEffect(() => {
    if (!activeVideo || !isPremium) return;

    const fetchSavedProgress = async () => {
      setFetchingProgress(true);
      try {
        const res = await fetch(`/api/progress/${activeVideo._id}`);
        if (res.ok) {
          const data = await res.json();
          setProgressSeconds(data.progressSeconds);
        } else {
          setProgressSeconds(0);
        }
      } catch (error) {
        setProgressSeconds(0);
      } finally {
        setFetchingProgress(false);
      }
    };

    fetchSavedProgress();
  }, [activeVideo, isPremium]);

  if (loading) return <div className="p-8 text-center dark:text-white flex items-center justify-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Loading curriculum...</div>;
  if (!activeVideo) return <div className="p-8 text-center dark:text-white">No lectures found for {subjectName}.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      
      {/* Left Side: The Video Player */}
      <div className="lg:w-2/3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{activeVideo.title}</h1>
        
        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 relative">
          
          {isPremium ? (
            // PREMIUM USER: Wait for progress to load, then show the Secure Player
            fetchingProgress ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                <p className="font-medium text-sm">Syncing your progress...</p>
              </div>
            ) : (
              // Use the key prop to force React to mount a fresh player when the video changes
              <SecureVideoPlayer 
                key={activeVideo._id} 
                videoId={activeVideo._id.toString()} 
                videoUrl={activeVideo.videoUrl} 
                startAtSeconds={progressSeconds} 
              />
            )
          ) : (
            // FREE USER: 30-second preview with upgrade overlay (Untracked)
            <div className="relative w-full h-full group">
              <video 
                src={`${activeVideo.videoUrl}#t=0,30`} 
                controls 
                controlsList="nodownload" 
                className="w-full h-full object-contain blur-[1px]" 
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center pointer-events-none group-hover:bg-black/70 transition-colors">
                <Lock className="text-white h-12 w-12 mb-4 drop-shadow-md" />
                <h3 className="text-white font-bold text-xl mb-4 drop-shadow-md">Premium Required for Full Access</h3>
                <Link 
                  href="/pricing" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 pointer-events-auto shadow-xl"
                >
                  Upgrade Now
                </Link>
                <p className="text-gray-300 text-sm mt-4 font-medium drop-shadow-md">Watching 30-second free preview</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Side: Playlist */}
      <div className="lg:w-1/3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PlayCircle className="text-blue-600" /> {subjectName} Playlist
        </h3>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {videos.map((video) => (
            <button
              key={video._id}
              onClick={() => setActiveVideo(video)}
              className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-start gap-3 ${activeVideo._id === video._id ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-600' : ''}`}
            >
              <PlayCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${activeVideo._id === video._id ? 'text-blue-600' : 'text-gray-400'}`} />
              <div>
                <p className={`font-medium ${activeVideo._id === video._id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {video.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {!isPremium ? "30s Preview" : "Full Lecture"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}