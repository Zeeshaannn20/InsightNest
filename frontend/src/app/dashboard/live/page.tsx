"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type { LiveSession } from "@/lib/types/database";

export default function StudentLivePage() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSessions() {
      if (!profile) return;
      
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", profile.id);

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e: any) => e.course_id);
        
        const { data } = await supabase
          .from("live_sessions")
          .select("*, course:courses(title)")
          .in("course_id", courseIds)
          .order("session_date", { ascending: false });

        if (data) {
          setSessions(data as unknown as LiveSession[]);
        }
      }
      setLoading(false);
    }
    
    fetchSessions();
  }, [profile, supabase]);

  const handleJoinClass = async (sessionId: string, meetLink: string | null) => {
    if (!profile) return;
    
    // Mark attendance
    await supabase.from("attendance").upsert({
      student_id: profile.id,
      session_id: sessionId,
      status: "present"
    });

    if (meetLink) {
      window.open(meetLink, "_blank");
    } else {
      alert("No Google Meet link provided for this session.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-primary-container mb-2 tracking-tight">Live Classes</h1>
        <p className="text-on-surface-variant text-base">Check schedules and join live lectures.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-card space-y-6">
        <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-6">
          <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">videocam</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-container">Class Schedule</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Join your enrolled sessions. Attendance is automatically marked when you click "Join Class".
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant bg-surface rounded-xl">
              <span className="material-symbols-outlined text-3xl mb-2">event_busy</span>
              <p>No live sessions scheduled.</p>
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className={`p-5 rounded-2xl border ${session.status === 'live' ? 'bg-red-50 border-red-200' : 'bg-surface border-outline-variant/30'}`}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${session.status === 'live' ? 'text-red-600 animate-pulse' : 'text-secondary'}`}>
                        {session.status === 'live' ? '• LIVE NOW' : session.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                        {new Date(session.session_date).toLocaleDateString()} at {session.start_time}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-primary-container">{session.title}</h3>
                    <p className="text-sm text-on-surface-variant">{session.course?.title}</p>
                  </div>
                  
                  <div>
                    {session.status === 'live' ? (
                      <button 
                        onClick={() => handleJoinClass(session.id, session.meet_link)}
                        className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined">videocam</span> Join Class
                      </button>
                    ) : session.status === 'scheduled' ? (
                      <button disabled className="bg-surface-container-high text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed w-full sm:w-auto text-center">
                        Scheduled
                      </button>
                    ) : (
                      <button disabled className="bg-green-100 text-green-700 px-6 py-2.5 rounded-xl font-bold text-sm cursor-not-allowed w-full sm:w-auto text-center">
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
