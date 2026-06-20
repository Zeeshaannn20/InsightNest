"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Announcement } from "@/lib/types/database";

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data } = await supabase
        .from("announcements")
        .select(`
          *,
          author:profiles!announcements_created_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (data) {
        setAnnouncements(data as unknown as Announcement[]);
      }
      setLoading(false);
    }
    
    fetchAnnouncements();
  }, [supabase]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span></div>;
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary-container mb-2 tracking-tight">Announcements</h1>
        <p className="text-on-surface-variant text-base">Important updates from your instructors and admins.</p>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">campaign</span>
            <h3 className="text-xl font-bold text-primary-container mb-2">All Caught Up!</h3>
            <p className="text-on-surface-variant">There are no new announcements right now.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  announcement.type === 'notification' ? 'bg-error-container text-on-error-container' :
                  announcement.type === 'deadline' ? 'bg-yellow-100 text-yellow-700' :
                  announcement.type === 'update' ? 'bg-secondary-container text-on-secondary-container' :
                  'bg-surface-container-highest text-on-surface'
                }`}>
                  <span className="material-symbols-outlined">
                    {announcement.type === 'notification' ? 'priority_high' :
                     announcement.type === 'deadline' ? 'event_busy' :
                     announcement.type === 'update' ? 'update' : 'campaign'}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-primary-container">{announcement.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    announcement.type === 'notification' ? 'bg-error-container text-on-error-container' :
                    announcement.type === 'deadline' ? 'bg-yellow-100 text-yellow-700' :
                    announcement.type === 'update' ? 'bg-secondary-container text-on-secondary-container' :
                    'bg-surface-container text-on-surface'
                  }`}>
                    {announcement.type}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">person</span>
                  {announcement.author?.full_name || 'Admin'}
                  <span className="mx-1">•</span>
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {new Date(announcement.created_at).toLocaleString()}
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 text-on-surface text-sm leading-relaxed whitespace-pre-wrap border border-outline-variant/20">
                  {announcement.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
