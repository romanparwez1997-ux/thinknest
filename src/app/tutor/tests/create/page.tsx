"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateMockTest() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  
  // Default state with one empty question
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], correctOptionIndex: 0, explanation: "" }
  ]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correctOptionIndex: 0, explanation: "" }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSaveTest = async () => {
    if (!title) return alert("Please provide a test title");
    
    // Validation check
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text) return alert(`Question ${i + 1} is missing text.`);
      if (questions[i].options.some(opt => !opt)) return alert(`Question ${i + 1} has empty options.`);
      if (!questions[i].explanation) return alert(`Question ${i + 1} is missing an explanation.`);
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, durationMinutes, questions }),
      });

      if (!res.ok) throw new Error("Failed to create test");

      alert("Mock Test published successfully!");
      router.push("/tutor/dashboard"); // Redirect back to tutor dashboard

    } catch (error) {
      console.error(error);
      alert("Error saving the test.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/tutor/dashboard" className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Mock Test</h1>
          </div>
          <button 
            onClick={handleSaveTest}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5" /> {isSubmitting ? "Publishing..." : "Publish Test"}
          </button>
        </div>

        {/* Test Settings */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Test Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mid-Term React Fundamentals"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Duration (Minutes)</label>
              <input 
                type="number" 
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Questions Editor */}
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 relative">
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">Question {qIndex + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => handleRemoveQuestion(qIndex)} className="text-red-500 hover:text-red-700 p-2">
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <textarea 
                value={q.text}
                onChange={(e) => handleQuestionChange(qIndex, "text", e.target.value)}
                placeholder="Type your question here..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none mb-6 min-h-[100px]"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${q.correctOptionIndex === optIndex ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input 
                      type="radio" 
                      name={`correct-${qIndex}`} 
                      checked={q.correctOptionIndex === optIndex}
                      onChange={() => handleQuestionChange(qIndex, "correctOptionIndex", optIndex)}
                      className="h-5 w-5 text-green-600 focus:ring-green-500"
                    />
                    <input 
                      type="text" 
                      value={opt}
                      onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Explanation (Shown after test)</label>
                <input 
                  type="text" 
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                  placeholder="Why is this the correct answer?"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

            </div>
          ))}
        </div>

        <button 
          onClick={handleAddQuestion}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 rounded-xl font-bold border-2 border-dashed border-gray-300 dark:border-gray-700 transition-colors"
        >
          <PlusCircle className="h-6 w-6" /> Add Another Question
        </button>

      </div>
    </div>
  );
}