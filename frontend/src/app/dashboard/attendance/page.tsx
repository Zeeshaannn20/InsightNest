"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Attendance, LiveSession } from "@/lib/types/database";

export default function StudentAttendancePage() {
  const { profile } = useAuth();
  const [attendance, setAttendance] = useState<(Attendance & { session: LiveSession })[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAttendance() {
      if (!profile) return;
      
      const { data } = await supabase
        .from("attendance")
        .select(`
          *,
          session:live_sessions(*)
        `)
        .eq("student_id", profile.id)
        .order("join_timestamp", { ascending: false });

      if (data) {
        setAttendance(data as unknown as (Attendance & { session: LiveSession })[]);
      }
      setLoading(false);
    }
    
    fetchAttendance();
  }, [profile, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span></div>;
  }

  // Calculate stats
  const totalAttended = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-primary-container mb-2 tracking-tight">Attendance Record</h1>
        <p className="text-on-surface-variant text-base">Track your participation in live sessions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium">Total Sessions</p>
            <p className="text-2xl font-bold text-primary-container">{totalAttended}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium">On Time</p>
            <p className="text-2xl font-bold text-primary-container">{presentCount}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">schedule</span>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant font-medium">Joined Late</p>
            <p className="text-2xl font-bold text-primary-container">{lateCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h3 className="text-lg font-bold text-primary-container mb-4 px-2">History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant/30 text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-xl">Session Title</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Joined At</th>
                <th className="px-6 py-4 font-semibold rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                    You haven't attended any sessions yet.
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary-container">{record.session?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{record.session ? new Date(record.session.session_date).toLocaleDateString() : 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{new Date(record.join_timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        record.status === 'present' ? "bg-green-100 text-green-700" : 
                        record.status === 'late' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {record.status.toUpperCase()}
                      </span>
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
