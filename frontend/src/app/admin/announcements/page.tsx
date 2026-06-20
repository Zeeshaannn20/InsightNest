"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Announcement } from "@/lib/types/database";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"general" | "update" | "deadline" | "notification">("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchAnnouncements();
  }, [supabase]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select(`
        *,
        author:profiles!announcements_created_by_fkey(full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setAnnouncements(data as unknown as Announcement[]);
    }
    setLoading(false);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      setError("You must be logged in to create announcements.");
      setIsSubmitting(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("announcements")
      .insert({
        title,
        content,
        type,
        created_by: session.user.id,
      })
      .select(`
        *,
        author:profiles!announcements_created_by_fkey(full_name)
      `)
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      setAnnouncements([data as unknown as Announcement, ...announcements]);
      setShowForm(false);
      setTitle("");
      setContent("");
      setType("general");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);
      
    if (error) {
      alert("Failed to delete announcement: " + error.message);
    } else {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Announcements</h1>
          <p className="text-on-surface-variant">Broadcast messages to students.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all btn-press shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined">{showForm ? "close" : "add"}</span>
          {showForm ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p>{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm mb-8 animate-slide-down">
          <h2 className="text-xl font-bold text-primary-container mb-4">Create Announcement</h2>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  placeholder="E.g., Class Rescheduled"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                >
                  <option value="general">General</option>
                  <option value="update">Course Update</option>
                  <option value="deadline">Deadline Reminder</option>
                  <option value="notification">Important Notification</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">Message Content</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all resize-none"
                placeholder="Type your announcement here..."
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-secondary text-on-secondary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all btn-press shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">send</span>
                )}
                Post Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">campaign</span>
            <p className="text-on-surface-variant">No announcements have been posted yet.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-4 relative group">
              <button 
                onClick={() => handleDelete(announcement.id)}
                className="absolute top-4 right-4 text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Announcement"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
              
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
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-outline-variant/50 text-on-surface-variant uppercase tracking-wider">
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
                <p className="text-on-surface leading-relaxed whitespace-pre-wrap text-sm">{announcement.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
