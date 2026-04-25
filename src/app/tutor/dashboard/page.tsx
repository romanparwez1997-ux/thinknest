"use client";

import { useState, useEffect } from 'react';
import { Users, Video as VideoIcon, UploadCloud, CheckCircle, PlayCircle, Trash2, Calendar, Radio } from 'lucide-react';
import { useSession } from 'next-auth/react';
import VideoUploader from '@/components/VideoUploader';

export default function TutorDashboard() {
  const { data: session } = useSession();
  
  // Video Upload State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [videoUrl, setVideoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [publishedVideos, setPublishedVideos] = useState<any[]>([]);

  // Live Class State
  const [liveTopic, setLiveTopic] = useState('');
  const [liveSubject, setLiveSubject] = useState('Physics');
  const [liveDate, setLiveDate] = useState('');
  const [liveLink, setLiveLink] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState('');
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]); // NEW: State for fetching classes

  // Fetch Videos
  const fetchVideos = async () => {
    try {
      const res = await fetch(`/api/videos?timestamp=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) setPublishedVideos(data.videos);
    } catch (error) {
      console.error("Failed to fetch videos");
    }
  };

  // Fetch Live Classes
  const fetchLiveClasses = async () => {
    try {
      const res = await fetch(`/api/live-classes?timestamp=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        // Adjust this depending on what your API returns (e.g., data.classes or just data)
        setUpcomingClasses(data.classes || data || []);
      }
    } catch (error) {
      console.error("Failed to fetch live classes");
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchLiveClasses();
  }, []);

  // --- HANDLERS ---

  const handleAwsUploadComplete = (url: string) => setVideoUrl(url);

  const handleSaveToDatabase = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subject, videoUrl }),
      });
      if (!res.ok) throw new Error("Failed to save to database");
      setSuccessMsg("Lecture successfully published!");
      setTitle('');
      setVideoUrl('');
      fetchVideos();
    } catch (error) {
      alert("Something went wrong saving the video.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!window.confirm("Are you sure you want to delete this lecture? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete video");
      setPublishedVideos((prev) => prev.filter((video) => video._id !== videoId));
    } catch (error) {
      alert("Something went wrong while deleting the video.");
    }
  };

  const handleScheduleLiveClass = async () => {
    setScheduling(true);
    setLiveSuccessMsg('');
    try {
      const res = await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: liveTopic, 
          subject: liveSubject, 
          scheduledAt: new Date(liveDate).toISOString(),
          meetingLink: liveLink
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule");
      setLiveSuccessMsg("Live class scheduled successfully!");
      setLiveTopic('');
      setLiveDate('');
      setLiveLink('');
      fetchLiveClasses(); // Refresh the list instantly!
    } catch (error) {
      alert("Failed to schedule the live class.");
    } finally {
      setScheduling(false);
      setTimeout(() => setLiveSuccessMsg(''), 3000);
    }
  };

  const handleCancelClass = async (classId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to cancel this live class? This cannot be undone.");
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/live-classes/${classId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUpcomingClasses(prev => prev.filter(c => c._id !== classId));
        alert("Class cancelled successfully.");
      } else {
        alert("Failed to cancel the class. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {session?.user?.name || 'Tutor'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Upload new lectures and manage your content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* --- LEFT SIDE: Video Uploader --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 dark:text-white">
            <UploadCloud className="text-blue-600" /> Upload New Lecture
          </h2>
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2 transition-all">
              <CheckCircle className="h-5 w-5" /> {successMsg}
            </div>
          )}
          <div className="space-y-4 mb-6 flex-grow">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lecture Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Kinematics Part 1" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-transparent dark:text-white">
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Math">Math</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
          </div>
          {!videoUrl ? (
            <VideoUploader onUploadComplete={handleAwsUploadComplete} />
          ) : (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-blue-500 mb-2" />
              <button onClick={handleSaveToDatabase} disabled={!title || saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
                {saving ? "Publishing..." : "Publish Lecture to Students"}
              </button>
            </div>
          )}
        </div>

        {/* --- RIGHT SIDE: Live Class Scheduler --- */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 dark:text-white">
            <Calendar className="text-red-500" /> Schedule Live Class
          </h2>
          {liveSuccessMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2 transition-all">
              <CheckCircle className="h-5 w-5" /> {liveSuccessMsg}
            </div>
          )}
          <div className="space-y-4 mb-6 flex-grow">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
              <input type="text" value={liveTopic} onChange={(e) => setLiveTopic(e.target.value)} placeholder="e.g., Organic Chemistry Q&A" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 bg-transparent dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select value={liveSubject} onChange={(e) => setLiveSubject(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 bg-transparent dark:text-white">
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Math">Math</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                <input type="datetime-local" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 bg-transparent dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Link (Zoom, Meet, etc.)</label>
              <input type="url" value={liveLink} onChange={(e) => setLiveLink(e.target.value)} placeholder="https://zoom.us/j/123456" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-red-500 focus:border-red-500 bg-transparent dark:text-white" />
            </div>
          </div>
          <button 
            onClick={handleScheduleLiveClass} 
            disabled={!liveTopic || !liveDate || !liveLink || scheduling} 
            className="w-full mt-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {scheduling ? "Scheduling..." : "Schedule Class"}
          </button>
        </div>

      </div>

      {/* --- NEW SECTION: Manage Upcoming Live Classes --- */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mt-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 dark:text-white">
          <Radio className="text-red-500" /> My Upcoming Live Classes
        </h2>
        
        {upcomingClasses.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No live classes scheduled. Schedule one above!</p>
        ) : (
          <div className="grid gap-4">
            {upcomingClasses.map((liveClass) => (
              <div key={liveClass._id} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
                <div>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-md mb-2 inline-block">
                    {liveClass.subject}
                  </span>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{liveClass.topic || liveClass.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(liveClass.scheduledAt || liveClass.startTime).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex w-full md:w-auto gap-3">
                  <a 
                    href={liveClass.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Start Stream
                  </a>
                  
                  <button 
                    onClick={() => handleCancelClass(liveClass._id)}
                    className="flex-1 md:flex-none justify-center bg-white dark:bg-gray-900 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-red-200 dark:border-red-800/50"
                  >
                    <Trash2 className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Display the list of uploaded videos! --- */}
     {/* --- Display the list of uploaded videos (NO PLAYBACK ALLOWED) --- */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mt-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 dark:text-white">
          <VideoIcon className="text-blue-600" /> Manage Published Lectures
        </h2>
        {publishedVideos.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">You haven't published any lectures yet. Upload one above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {publishedVideos.map((video) => (
              <div key={video._id} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-800/50 flex flex-col">
                
                {/* THE FIX: Static Thumbnail instead of Video Player */}
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                  <VideoIcon className="h-10 w-10 text-blue-200 dark:text-gray-700" />
                  <div className="absolute top-3 right-3 bg-white/80 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                    File Secured
                  </div>
                </div>

                <div className="p-4 flex-grow flex flex-col">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{video.subject}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white mt-1 line-clamp-2">{video.title}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <UploadCloud className="h-3 w-3" /> {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                    
                    {/* Only the Delete Action remains */}
                    <button 
                      onClick={() => handleDelete(video._id)} 
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-md transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}