"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Quiz } from "@/lib/types/database";

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchQuizzes();
  }, [supabase]);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        course:courses(title)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setQuizzes(data as unknown as Quiz[]);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Quizzes</h1>
          <p className="text-on-surface-variant">Manage assessments and quizzes.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Passing score</th>
                <th className="px-6 py-4 font-semibold">Time limit</th>
                <th className="px-6 py-4 font-semibold">Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No quizzes found.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary-container">{quiz.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface line-clamp-1">{quiz.course?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{quiz.passing_score ?? "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">
                        {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : "No limit"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{quiz.max_attempts ?? "Unlimited"}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
