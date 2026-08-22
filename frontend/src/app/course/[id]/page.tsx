"use client";

import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useState, useEffect, useRef, use, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import LessonPlayer from "@/components/LessonPlayer";
import { COMPLETION_RATIO, saveVideoProgress, syncCourseProgress } from "@/lib/progress";

interface ChatMessage {
  id: string;
  sender: "student" | "instructor";
  name: string;
  text: string;
  timestamp: string;
  reply?: string;
}

export default function CourseViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("description");
  const [rightTab, setRightTab] = useState("curriculum");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string | null>(null);
  /** null when playing a standalone recording, which has no lesson to track. */
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [resumeAt, setResumeAt] = useState(0);

  const [userId, setUserId] = useState<string | null>(null);
  /** lesson_id -> saved position and completion */
  const [progress, setProgress] = useState<
    Record<string, { last_position_sec: number; is_completed: boolean }>
  >({});
  const lastSavedRef = useRef<Record<string, number>>({});

  const allLessons = modules.flatMap((m: any) => m.lessons ?? []);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l: any) => progress[l.id]?.is_completed).length;
  const percentComplete =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handlePlayVideo = (url: string | null, title: string, lessonId: string | null = null) => {
    if (!url) return;
    setActiveVideoUrl(url);
    setActiveVideoTitle(title);
    setActiveLessonId(lessonId);
    setResumeAt(lessonId ? progress[lessonId]?.last_position_sec ?? 0 : 0);
  };

  /** Persist completion for one lesson, then refresh the course rollup. */
  const markLesson = useCallback(
    async (lessonId: string, seconds: number, completed: boolean) => {
      if (!userId) return;

      setProgress((prev) => ({
        ...prev,
        [lessonId]: { last_position_sec: Math.floor(seconds), is_completed: completed },
      }));

      await saveVideoProgress(supabase, userId, lessonId, seconds, completed);

      const nowCompleted = allLessons.filter((l: any) =>
        l.id === lessonId ? completed : progress[l.id]?.is_completed
      ).length;
      await syncCourseProgress(supabase, userId, id, nowCompleted, totalLessons);
    },
    [userId, supabase, id, allLessons, progress, totalLessons]
  );

  const handleProgress = useCallback(
    (seconds: number, duration: number) => {
      if (!activeLessonId || !userId) return;

      // Skip tiny deltas so a long lecture doesn't hammer the database.
      const last = lastSavedRef.current[activeLessonId] ?? -Infinity;
      const finished =
        duration > 0 && seconds / duration >= COMPLETION_RATIO;
      if (!finished && Math.abs(seconds - last) < 5) return;
      lastSavedRef.current[activeLessonId] = seconds;

      const alreadyDone = progress[activeLessonId]?.is_completed ?? false;
      markLesson(activeLessonId, seconds, alreadyDone || finished);
    },
    [activeLessonId, userId, progress, markLesson]
  );

  /** Jump back to the most recently watched lesson, or the first unwatched one. */
  const handleResume = () => {
    const watched = allLessons
      .filter((l: any) => progress[l.id])
      .sort(
        (a: any, b: any) =>
          (progress[b.id]?.last_position_sec ?? 0) - (progress[a.id]?.last_position_sec ?? 0)
      );
    const target =
      watched.find((l: any) => !progress[l.id]?.is_completed) ??
      allLessons.find((l: any) => !progress[l.id]?.is_completed && l.video_url) ??
      watched[0];
    if (target?.video_url) handlePlayVideo(target.video_url, target.title, target.id);
  };

  useEffect(() => {
    async function fetchCourseData() {
      const { data: cData } = await supabase
        .from("courses")
        .select(`*, profiles(full_name)`)
        .eq("id", id)
        .single();

      if (cData) setCourse(cData);

      const { data: mData } = await supabase
        .from("modules")
        .select(`*, lessons(*)`)
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (mData) {
        mData.forEach((m: any) => {
          m.lessons.sort((a: any, b: any) => a.order_index - b.order_index);
        });
        setModules(mData);
      }

      const { data: recData } = await supabase
        .from("recorded_lectures")
        .select("*")
        .eq("course_id", id)
        .order("created_at", { ascending: true });

      if (recData) {
        setRecordings(recData);
      }

      // Saved playback positions for this viewer, across this course's lessons.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const lessonIds = (mData ?? []).flatMap((m: any) =>
          (m.lessons ?? []).map((l: any) => l.id)
        );

        if (lessonIds.length > 0) {
          const { data: progressRows } = await supabase
            .from("video_progress")
            .select("lesson_id, last_position_sec, is_completed")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds);

          if (progressRows) {
            setProgress(
              Object.fromEntries(
                progressRows.map((row: any) => [
                  row.lesson_id,
                  {
                    last_position_sec: row.last_position_sec ?? 0,
                    is_completed: Boolean(row.is_completed),
                  },
                ])
              )
            );
          }
        }
      }

      setLoading(false);
    }
    fetchCourseData();
  }, [id, supabase]);

  useEffect(() => {
    // Load real-time chat messages from Supabase in the future.
    // For now, start empty instead of the fake mock messages.
    const stored = localStorage.getItem(`lms_chat_${id}`);
    if (stored) {
      setChatMessages(JSON.parse(stored));
    } else {
      setChatMessages([]);
    }
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, rightTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: "student",
      name: "You",
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...chatMessages, msg];
    localStorage.setItem(`lms_chat_${id}`, JSON.stringify(updated));
    setChatMessages(updated);
    setNewMessage("");
  };

  const toggleModule = (moduleId: string) => {
    const updated = [...modules];
    const mod = updated.find(m => m.id === moduleId);
    if (mod) mod.isOpen = !mod.isOpen;
    setModules(updated);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-background text-on-surface">Loading course...</div>;
  }

  if (!course) {
    return <div className="flex justify-center items-center h-screen bg-background text-on-surface">Course not found.</div>;
  }

  const instructorName = course.profiles?.full_name || "Unknown Instructor";

  return (
    <div className="bg-background text-on-surface flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar variant="student" />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-sidebar-width h-screen overflow-hidden flex flex-col">
        
        {/* Top App Bar */}
        <header className="h-16 flex items-center justify-between px-6 md:px-10 bg-surface shadow-sm z-40 border-b border-outline-variant/20 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-on-surface hover:text-secondary transition-colors font-medium text-sm">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </Link>
          
          <div className="hidden md:flex items-center gap-4 w-1/3">
            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-on-surface-variant whitespace-nowrap">
              {percentComplete}% Complete
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">U</div>
          </div>
        </header>

        {/* Split View */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Panel (70%) - Video & Content */}
          <section className="w-full lg:w-[70%] flex flex-col bg-background overflow-y-auto custom-scrollbar">
            
            {/* Video Container */}
            <div className="aspect-video bg-black relative w-full flex-shrink-0 flex items-center justify-center border-b border-outline-variant/20">
              <LessonPlayer
                key={activeVideoUrl ?? "empty"}
                videoUrl={activeVideoUrl}
                title={activeVideoTitle}
                startAtSec={resumeAt}
                onProgress={handleProgress}
                onEnded={() => {
                  if (activeLessonId) {
                    markLesson(activeLessonId, progress[activeLessonId]?.last_position_sec ?? 0, true);
                  }
                }}
              />
            </div>

            {/* Video Metadata */}
            <div className="p-6 md:p-10 flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-primary-container mb-2">{course.title}</h1>
                  <p className="text-sm text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">person</span> Instructor: {instructorName}
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={handleResume}
                    disabled={totalLessons === 0}
                    className="border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() =>
                      activeLessonId &&
                      markLesson(
                        activeLessonId,
                        progress[activeLessonId]?.last_position_sec ?? 0,
                        !progress[activeLessonId]?.is_completed
                      )
                    }
                    disabled={!activeLessonId}
                    className="bg-primary-container text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-container/90 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {activeLessonId && progress[activeLessonId]?.is_completed
                        ? "check_circle"
                        : "radio_button_unchecked"}
                    </span>
                    {activeLessonId && progress[activeLessonId]?.is_completed
                      ? "Completed"
                      : "Mark Complete"}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 border-b border-outline-variant/30 mb-8">
                {['Description', 'Recordings', 'Assignments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-4 font-semibold text-sm transition-colors relative ${
                      activeTab === tab.toLowerCase() 
                        ? 'text-secondary border-b-2 border-secondary' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "description" && (
                <div className="animate-fade-in text-on-surface-variant leading-relaxed">
                  <p>{course.description || "No description provided for this course."}</p>
                </div>
              )}

              {activeTab === "recordings" && (
                <div className="space-y-4 animate-fade-in text-on-surface-variant">
                  {recordings.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-low/20">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-1">movie</span>
                      <p className="text-sm">No class recordings available yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recordings.map((rec) => (
                        <button
                          key={rec.id}
                          onClick={() => handlePlayVideo(rec.youtube_url, rec.title)}
                          className="flex items-start gap-4 p-4 rounded-xl border border-outline-variant/30 hover:border-secondary hover:bg-surface-container/30 text-left transition-all group w-full cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-2xl">play_circle</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-primary-container group-hover:text-secondary transition-colors text-sm line-clamp-1">
                              {rec.title}
                            </h4>
                            <p className="text-xs text-on-surface-variant mt-1">
                              Duration: {rec.duration_minutes || 0} mins
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="space-y-4 animate-fade-in text-on-surface-variant">
                  <p>No assignments posted yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right Panel (30%) - Course Curriculum & Live Chat */}
          <aside className="hidden lg:flex w-[30%] flex-col bg-surface border-l border-outline-variant/30 overflow-hidden flex-shrink-0">
            <div className="p-6 border-b border-outline-variant/20 flex-shrink-0 bg-surface-bright flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-primary-container">Class Portal</h2>
              </div>
              <div className="flex gap-2 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
                <button 
                  onClick={() => setRightTab("curriculum")} 
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${rightTab === "curriculum" ? "bg-secondary text-on-secondary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Syllabus
                </button>
                <button 
                  onClick={() => setRightTab("chat")} 
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${rightTab === "chat" ? "bg-secondary text-on-secondary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Direct Q&A
                </button>
              </div>
            </div>
            
            {rightTab === "curriculum" ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {modules.length === 0 ? (
                  <div className="p-6 text-center text-sm text-on-surface-variant">
                    Syllabus is empty. Modules will appear here once added by the instructor.
                  </div>
                ) : (
                  modules.map((mod, index) => (
                    <div key={mod.id} className="border-b border-outline-variant/20 bg-surface-container-lowest">
                      <button 
                        onClick={() => toggleModule(mod.id)}
                        className="w-full p-5 flex items-center justify-between hover:bg-surface-container/50 transition-colors text-left"
                      >
                        <div>
                          <h3 className="font-bold text-secondary">Module {index + 1}: {mod.title}</h3>
                          <p className="text-xs text-on-surface-variant mt-1">{mod.lessons?.length || 0} Lessons</p>
                        </div>
                        <span className={`material-symbols-outlined text-secondary transition-transform duration-300 ${mod.isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>
                      
                      {mod.isOpen && (
                        <div className="pb-2 animate-slide-down">
                          {mod.lessons?.map((lesson: any) => {
                            const isPlayable = Boolean(lesson.video_url);
                            return (
                              <button
                                key={lesson.id}
                                disabled={!isPlayable}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (lesson.video_url) {
                                    handlePlayVideo(lesson.video_url, lesson.title, lesson.id);
                                  }
                                }}
                                className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-surface-container/30 transition-colors text-left ${
                                  !isPlayable ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                                } ${activeLessonId === lesson.id ? "bg-secondary/10" : ""}`}
                              >
                                <span
                                  className={`material-symbols-outlined text-[20px] ${
                                    progress[lesson.id]?.is_completed ? "text-secondary" : "text-outline"
                                  }`}
                                >
                                  {progress[lesson.id]?.is_completed
                                    ? "check_circle"
                                    : isPlayable
                                      ? "play_circle"
                                      : "lock"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-on-surface truncate">{lesson.title}</p>
                                  <p className="text-xs text-outline">
                                    {lesson.duration ? String(lesson.duration) : "Lesson"}
                                    {lesson.is_free_preview ? " • Free preview" : ""}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                          {(!mod.lessons || mod.lessons.length === 0) && (
                            <div className="px-6 py-3 text-xs text-outline">No lessons in this module.</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-surface-container-lowest overflow-hidden">
                {/* Chat Message Box */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-xs text-outline mt-10">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="space-y-1.5 animate-slide-up">
                        <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender === "instructor" ? "bg-secondary-container/20 border border-secondary/20 mr-auto text-on-secondary-container" : "bg-surface border border-outline-variant/30 ml-auto text-on-surface"}`}>
                          <div className="flex items-center gap-2 mb-1 justify-between">
                            <span className="font-bold text-xs opacity-75">{msg.name}</span>
                            <span className="text-[10px] text-outline font-medium">{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                        
                        {msg.reply && (
                          <div className="p-3 rounded-2xl max-w-[85%] text-sm bg-secondary-container/20 border border-secondary/20 mr-auto text-on-secondary-container animate-fade-in">
                            <div className="flex items-center gap-2 mb-1 justify-between">
                              <span className="font-bold text-xs text-secondary">{instructorName} (Instructor)</span>
                              <span className="text-[10px] text-outline font-medium">Just now</span>
                            </div>
                            <p className="leading-relaxed">{msg.reply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Chat Input Field */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/30 bg-surface-bright flex gap-2">
                  <input
                    type="text"
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary transition-all"
                    placeholder="Ask a question..."
                  />
                  <button type="submit" className="w-10 h-10 bg-secondary text-on-secondary rounded-xl flex items-center justify-center hover:bg-secondary/90 transition-colors btn-press flex-shrink-0">
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </form>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
