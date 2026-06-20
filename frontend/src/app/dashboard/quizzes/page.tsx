"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Quiz, QuizResult } from "@/lib/types/database";

type QuizWithResult = Quiz & { result?: QuizResult };

export default function StudentQuizzesPage() {
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizWithResult[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchQuizzes() {
      if (!profile) return;
      
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", profile.id);

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e: any) => e.course_id);
        
        const { data: quizzesData } = await supabase
          .from("quizzes")
          .select("*, course:courses(title)")
          .in("course_id", courseIds)
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (quizzesData) {
          // Fetch results for this student
          const { data: resultsData } = await supabase
            .from("quiz_results")
            .select("*")
            .eq("student_id", profile.id);
            
          const resultsMap = new Map(resultsData?.map((r: QuizResult) => [r.quiz_id, r]) || []);
          
          const combined = quizzesData.map((q: any) => ({
            ...q,
            result: resultsMap.get(q.id)
          })) as unknown as QuizWithResult[];
          
          setQuizzes(combined);
        }
      }
      setLoading(false);
    }
    
    fetchQuizzes();
  }, [profile, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-primary-container mb-2 tracking-tight">Quizzes</h1>
        <p className="text-on-surface-variant text-base">Test your knowledge and track your progress.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {quizzes.length === 0 ? (
          <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">quiz</span>
            <h3 className="text-xl font-bold text-primary-container mb-2">No Quizzes Available</h3>
            <p className="text-on-surface-variant">There are currently no active quizzes for your courses.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm hover:border-secondary transition-colors group flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    quiz.result?.passed ? 'bg-green-100 text-green-700' :
                    quiz.result && !quiz.result.passed ? 'bg-red-100 text-red-700' :
                    'bg-secondary/15 text-secondary'
                  }`}>
                    {quiz.result ? (quiz.result.passed ? 'Passed' : 'Failed') : 'Pending'}
                  </span>
                  <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
                    {(quiz as any).course?.title}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-primary-container mb-2">{quiz.title}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{quiz.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/30">
                    <span className="text-xs text-on-surface-variant font-medium block">Time Limit</span>
                    <span className="font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">timer</span>
                      {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} mins` : 'No limit'}
                    </span>
                  </div>
                  <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/30">
                    <span className="text-xs text-on-surface-variant font-medium block">Total Marks</span>
                    <span className="font-bold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">military_tech</span>
                      {quiz.total_marks}
                    </span>
                  </div>
                </div>
              </div>

              {quiz.result ? (
                <div className={`p-4 rounded-xl border ${quiz.result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} flex items-center justify-between`}>
                  <div>
                    <p className={`font-bold ${quiz.result.passed ? 'text-green-800' : 'text-red-800'}`}>Score: {quiz.result.score} / {quiz.result.total_marks}</p>
                    <p className={`text-xs ${quiz.result.passed ? 'text-green-700' : 'text-red-700'}`}>Attempted on {new Date(quiz.result.attempted_at).toLocaleDateString()}</p>
                  </div>
                  <span className="material-symbols-outlined text-3xl">
                    {quiz.result.passed ? 'check_circle' : 'cancel'}
                  </span>
                </div>
              ) : (
                <button className="w-full bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all btn-press shadow-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_arrow</span> Start Quiz
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
