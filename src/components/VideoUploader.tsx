"use client";

import { useState } from "react";
import { UploadCloud, FileVideo, CheckCircle } from "lucide-react";

export default function VideoUploader({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // 1. Get the Presigned URL from our Next.js backend
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      
      const { presignedUrl, publicUrl, error } = await res.json();
      if (error) throw new Error(error);

      // 2. Upload the video DIRECTLY to AWS S3 using XMLHttpRequest (to track progress)
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            onUploadComplete(publicUrl); // Pass the final video URL back to the parent component
            resolve(true);
          } else {
            reject("Upload failed at AWS");
          }
        };

        xhr.onerror = () => reject("Network error during upload");

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

    } catch (error) {
      console.error(error);
      alert("Failed to upload video.");
    } finally {
      setUploading(false);
      setFile(null);
      setProgress(0);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center bg-gray-50 dark:bg-gray-900/50">
      <FileVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      
      {!uploading ? (
        <>
          <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={handleFileChange} className="hidden" id="video-upload" />
          <label htmlFor="video-upload" className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-block mb-4">
            {file ? file.name : "Select Video File"}
          </label>
          
          {file && (
            <button onClick={handleUpload} className="block w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Start Upload to AWS
            </button>
          )}
        </>
      ) : progress === 100 ? (
         <div className="flex flex-col items-center text-green-600 dark:text-green-500">
           <CheckCircle className="h-10 w-10 mb-2" />
           <p className="font-bold">Upload Complete!</p>
         </div>
      ) : (
        <div className="w-full">
          <div className="flex justify-between text-sm mb-1 font-medium dark:text-gray-300">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}