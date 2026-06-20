"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LiveSession, Course } from "@/lib/types/database";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Google Calendar Integration states
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [checkingGoogle, setCheckingGoogle] = useState(true);
  const [googleAuthUrl, setGoogleAuthUrl] = useState("http://localhost:5001/api/auth/google");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [createMeetLink, setCreateMeetLink] = useState(true);

  // Associated Assignment states
  const [createAssignment, setCreateAssignment] = useState(false);
  const [assignmentInstructions, setAssignmentInstructions] = useState("");
  const [assignmentMaxMarks, setAssignmentMaxMarks] = useState(100);
  const [assignmentDeadlineDate, setAssignmentDeadlineDate] = useState("");
  const [assignmentDeadlineTime, setAssignmentDeadlineTime] = useState("23:59");

  const supabase = createClient();

  useEffect(() => {
    fetchSessions();
    fetchCourses();
    checkGoogleStatus();
    
    // Setup Google Auth URL dynamically with the user's active session token
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (session?.access_token) {
        const origin = window.location.origin;
        setGoogleAuthUrl(`http://localhost:5001/api/auth/google?token=${session.access_token}&origin=${origin}`);
      }
    });

    // Check URL query parameters for callback redirects
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      setSuccessMsg("Successfully connected Google Calendar!");
      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Update default deadline date automatically when session date changes
  useEffect(() => {
    if (sessionDate) {
      const date = new Date(sessionDate);
      date.setDate(date.getDate() + 7);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setAssignmentDeadlineDate(`${year}-${month}-${day}`);
    }
  }, [sessionDate]);

  const checkGoogleStatus = async () => {
    setCheckingGoogle(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("http://localhost:5001/api/admin/google-status", {
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      });
      const data = await res.json();
      if (res.ok) {
        setIsGoogleConnected(data.isConnected);
      }
    } catch (err) {
      console.error("Error checking Google status:", err);
    }
    setCheckingGoogle(false);
  };

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("live_sessions")
      .select(`
        *,
        course:courses(title),
        instructor:profiles!live_sessions_instructor_id_fkey(full_name)
      `)
      .order("session_date", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setSessions(data as unknown as LiveSession[]);
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_published", true);

    if (!error && data) {
      setCourses(data as Course[]);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("http://localhost:5001/api/admin/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          course_id: courseId,
          title,
          description,
          session_date: sessionDate,
          start_time: startTime,
          end_time: endTime,
          create_meet_link: createMeetLink
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      // If associated assignment is requested, insert it directly
      if (createAssignment) {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error("Live class created, but failed to authenticate for assignment creation.");
        }

        const deadlineISO = new Date(`${assignmentDeadlineDate}T${assignmentDeadlineTime || "23:59"}`).toISOString();

        const { error: assignmentError } = await supabase
          .from("assignments")
          .insert({
            course_id: courseId,
            title: `Assignment: ${title}`,
            instructions: assignmentInstructions || `Homework assignment for live class: ${title}`,
            max_marks: Number(assignmentMaxMarks),
            deadline: deadlineISO,
            created_by: user.id
          });

        if (assignmentError) {
          console.error("Assignment creation error:", assignmentError);
          setSuccessMsg("Session scheduled successfully, but associated homework assignment failed: " + assignmentError.message);
        } else {
          setSuccessMsg("Session scheduled and homework assignment created successfully!");
        }
      } else {
        setSuccessMsg("Session scheduled successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchSessions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setCourseId("");
    setTitle("");
    setDescription("");
    setSessionDate("");
    setStartTime("");
    setEndTime("");
    setCreateMeetLink(true);
    setCreateAssignment(false);
    setAssignmentInstructions("");
    setAssignmentMaxMarks(100);
    setAssignmentDeadlineDate("");
    setAssignmentDeadlineTime("23:59");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Live Sessions</h1>
          <p className="text-on-surface-variant">Manage scheduled classes and Google Meet rooms.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Google Connection Status Button */}
          {checkingGoogle ? (
            <div className="h-10 w-44 bg-surface-container-low rounded-xl animate-pulse" />
          ) : isGoogleConnected ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Google Connected</span>
            </div>
          ) : (
            <a
              href={googleAuthUrl}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/50 text-on-surface rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-primary text-base">link</span>
              Connect Google Calendar
            </a>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Schedule Session
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3 animate-shake">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm flex items-start gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Course</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Google Meet</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No live sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary-container">{session.title}</div>
                      <div className="text-xs text-on-surface-variant truncate max-w-xs">{session.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface line-clamp-1">{session.course?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{new Date(session.session_date).toLocaleDateString()}</div>
                      <div className="text-xs text-on-surface-variant">{session.start_time} - {session.end_time}</div>
                    </td>
                    <td className="px-6 py-4">
                      {session.meet_link ? (
                        <a
                          href={session.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">video_call</span>
                          Join Meet
                        </a>
                      ) : (
                        <span className="text-xs text-on-surface-variant">No link generated</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        session.status === 'live' ? "bg-red-100 text-red-700 animate-pulse" : 
                        session.status === 'scheduled' ? "bg-blue-100 text-blue-700" :
                        session.status === 'completed' ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {session.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary-container">Schedule Live Class</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Course *
                </label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface transition-all"
                >
                  <option value="">Select a Course</option>
                  {!courses.some(c => c.title === "Generative AI with Data Analytics" || c.id === "11111111-1111-1111-1111-111111111111") && (
                    <option value="11111111-1111-1111-1111-111111111111">
                      Generative AI with Data Analytics
                    </option>
                  )}
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Neural Networks"
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide topics to cover or pre-requisites..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface transition-all"
                  />
                </div>
              </div>

              {/* Google Meet Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 mt-2">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">video_camera_front</span>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Generate Google Meet Link</h4>
                    <p className="text-xs text-on-surface-variant">Automatically create a meeting room via Google Calendar</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createMeetLink}
                    disabled={!isGoogleConnected}
                    onChange={(e) => setCreateMeetLink(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-surface-container-high rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant/55 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${!isGoogleConnected ? 'opacity-40 cursor-not-allowed' : ''}`} />
                </label>
              </div>

              {/* Associated Assignment Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/20 mt-2">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">assignment</span>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Create Associated Homework</h4>
                    <p className="text-xs text-on-surface-variant">Automatically schedule an assignment for this session</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAssignment}
                    onChange={(e) => setCreateAssignment(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-outline-variant/55 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {createAssignment && (
                <div className="p-4 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                      Assignment Instructions
                    </label>
                    <textarea
                      value={assignmentInstructions}
                      onChange={(e) => setAssignmentInstructions(e.target.value)}
                      placeholder="e.g. Write a summary of today's lecture..."
                      rows={2}
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Max Marks
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={assignmentMaxMarks}
                        onChange={(e) => setAssignmentMaxMarks(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Deadline Date
                      </label>
                      <input
                        type="date"
                        required
                        value={assignmentDeadlineDate}
                        onChange={(e) => setAssignmentDeadlineDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                        Deadline Time
                      </label>
                      <input
                        type="time"
                        required
                        value={assignmentDeadlineTime}
                        onChange={(e) => setAssignmentDeadlineTime(e.target.value)}
                        className="w-full px-2 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!isGoogleConnected && (
                <p className="text-xs text-error font-medium flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">info</span>
                  Connect your Google account to enable Meet link creation.
                </p>
              )}

              <div className="pt-4 border-t border-outline-variant/20 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                  <span>{submitting ? "Scheduling..." : "Schedule"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
