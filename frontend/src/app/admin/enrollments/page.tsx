"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AdminEnrollmentsPage() {
  const [courses, setCourses] = useState<{ id: string; title: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentEmail, setStudentEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClient();
  const { session } = useAuth();

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, status")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCourses(data);
        if (data.length > 0) {
          setCourseId(data[0].id);
        }
      }
      setLoading(false);
    }

    fetchCourses();
  }, [supabase]);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail || !courseId) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/admin/grant-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ studentEmail, courseId })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || "Access granted successfully" });
        setStudentEmail(""); // Reset email
      } else {
        setMessage({ type: 'error', text: data.error || "Failed to grant access" });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "An unexpected error occurred" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="material-symbols-outlined animate-spin text-5xl text-secondary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container">Grant Student Access</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manually enroll students who paid via social media or offline channels.</p>
        </div>
      </div>

      <div className="max-w-xl bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 shadow-card">
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-error-container text-on-error-container border border-error/20'
          }`}>
            <span className="material-symbols-outlined mt-0.5">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleGrantAccess} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">Student Email Address</label>
            <input
              type="email"
              required
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm"
            />
            <p className="text-xs text-on-surface-variant">If the student does not have an account, one will be created and they will receive an invite email.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">Select Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm text-on-surface"
              required
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} {course.status === 'closed' ? '(Closed)' : course.status === 'coming_soon' ? '(Coming Soon)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-secondary text-on-secondary py-3.5 rounded-xl font-bold hover:bg-secondary/90 transition-all btn-press shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">person_add</span>
                Grant Dashboard Access
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
