"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/database";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchStudents();
  }, [supabase]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setStudents(data as Profile[]);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update status.");
    } else {
      setStudents(students.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    }
  };

  const handleAssignEnrollmentId = async (id: string) => {
    const newId = `DA${new Date().getFullYear()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const { error } = await supabase
      .from("profiles")
      .update({ enrollment_id: newId, is_active: true })
      .eq("id", id);

    if (error) {
      alert("Failed to assign enrollment ID. It might already be in use.");
    } else {
      setStudents(students.map(s => s.id === id ? { ...s, enrollment_id: newId, is_active: true } : s));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Students</h1>
          <p className="text-on-surface-variant">Manage enrollments and user access.</p>
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
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Enrollment ID</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary-container">{student.full_name}</div>
                      <div className="text-xs text-on-surface-variant">Joined {new Date(student.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{student.email}</div>
                      <div className="text-xs text-on-surface-variant">{student.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {student.enrollment_id ? (
                        <span className="font-mono bg-surface-container px-2 py-1 rounded text-xs border border-outline-variant/30">
                          {student.enrollment_id}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAssignEnrollmentId(student.id)}
                          className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg hover:bg-secondary/20 transition-colors"
                        >
                          Assign ID
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        student.is_active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {student.is_active ? "Active" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(student.id, student.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          student.is_active 
                            ? "bg-error/10 text-error hover:bg-error/20" 
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {student.is_active ? "Deactivate" : "Activate"}
                      </button>
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
