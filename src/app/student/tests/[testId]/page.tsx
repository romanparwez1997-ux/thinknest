"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function TestInterface() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Maps question ID to the selected option index
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. FETCH THE SECURE TEST DATA
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        if (!res.ok) throw new Error("Test not found");
        const data = await res.json();
        setTest(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load test. It may not exist.");
        router.push("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, router]);

  // 2. THE ANTI-CHEAT TIMER
  useEffect(() => {
    if (!test) return;

    const storageKey = `thinknest_test_end_${test._id}`;
    let endTimeStr = localStorage.getItem(storageKey);

    if (!endTimeStr) {
      // First time starting the test: Calculate future end time
      const endTime = Date.now() + test.durationMinutes * 60 * 1000;
      localStorage.setItem(storageKey, endTime.toString());
      endTimeStr = endTime.toString();
    }

    const endTime = parseInt(endTimeStr, 10);

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
      
      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        handleSubmitTest(true); // Force submit!
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [test]);

  // 3. HANDLE ANSWER SELECTION
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // 4. SUBMIT TO BACKEND GRADER
  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const confirmed = confirm("Are you sure you want to submit your test?");
      if (!confirmed) return;
    }

    setIsSubmitting(true);

    try {
      // Format answers for the database
      const formattedAnswers = Object.keys(answers).map((qId) => ({
        questionId: qId,
        selectedOptionIndex: answers[qId],
      }));

      // We will build this API endpoint next!
      const res = await fetch(`/api/tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      // Clean up the timer
      localStorage.removeItem(`thinknest_test_end_${test._id}`);
      
      alert("Test submitted successfully!");
      router.push("/student/dashboard"); // Or route to a Results page

    } catch (error) {
      console.error(error);
      alert("There was an error saving your test.");
      setIsSubmitting(false);
    }
  };

  // UTILITY: Format Seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Exam Securely...</div>;
  }

  if (!test) return null;

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT/TOP: The Main Question Area */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-10 flex flex-col min-h-[60vh]">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{test.title}</h1>
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-bold px-4 py-1.5 rounded-full text-sm">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Options Grid */}
          <div className="space-y-4 flex-grow">
            {currentQuestion.options.map((option: string, index: number) => {
              const isSelected = answers[currentQuestion._id] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(currentQuestion._id, index)}
                  className={`w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm" 
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "border-blue-600" : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {isSelected && <div className="h-3 w-3 bg-blue-600 rounded-full" />}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next/Prev Controls */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" /> Previous
            </button>

            {currentQuestionIndex === test.questions.length - 1 ? (
              <button
                onClick={() => handleSubmitTest(false)}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Final Test"} <CheckCircle className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-colors"
              >
                Next <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT/BOTTOM: The Navigation Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Timer Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center sticky top-24">
            <div className="inline-flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Time Remaining</p>
            <div className={`text-4xl font-extrabold ${timeLeft !== null && timeLeft < 300 ? "text-red-600 animate-pulse" : "text-gray-900 dark:text-white"}`}>
              {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
            </div>
            {timeLeft !== null && timeLeft < 300 && (
              <p className="text-red-500 text-sm mt-2 font-bold flex items-center justify-center gap-1">
                <AlertCircle className="h-4 w-4" /> Less than 5 mins!
              </p>
            )}
          </div>

          {/* Question Navigator Grid */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <p className="font-bold text-gray-900 dark:text-white mb-4">Test Navigator</p>
            <div className="grid grid-cols-5 gap-2">
              {test.questions.map((_: any, index: number) => {
                const isAnswered = answers[test.questions[index]._id] !== undefined;
                const isCurrent = currentQuestionIndex === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`h-10 w-full rounded-md font-bold text-sm flex items-center justify-center transition-all ${
                      isCurrent 
                        ? "ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-900" 
                        : ""
                    } ${
                      isAnswered 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-100 border border-green-200 dark:bg-green-900/40 dark:border-green-800" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700" /> Unanswered
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}