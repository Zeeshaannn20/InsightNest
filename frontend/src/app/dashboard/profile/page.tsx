"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function StudentProfilePage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setSuccess(false);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
      })
      .eq("id", profile.id);
      
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-container mb-2 tracking-tight">My Profile</h1>
        <p className="text-on-surface-variant text-base">Manage your personal information.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-card">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-outline-variant/30">
          <div className="w-24 h-24 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-3xl font-bold border-4 border-surface shadow-sm">
            {profile.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary-container">{profile.full_name}</h2>
            <p className="text-on-surface-variant mb-2">{profile.email}</p>
            <div className="inline-block bg-surface-container-high px-3 py-1 rounded-md text-xs font-bold text-on-surface tracking-wider">
              ID: {profile.enrollment_id}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container opacity-70 cursor-not-allowed text-on-surface"
              />
              <p className="text-xs text-on-surface-variant mt-1">Contact admin to change email.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-on-surface"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all btn-press shadow-sm flex items-center justify-center min-w-[140px]"
            >
              {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Save Changes"}
            </button>
            {success && (
              <span className="text-green-600 font-bold text-sm flex items-center gap-1 animate-fade-in">
                <span className="material-symbols-outlined">check_circle</span> Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
