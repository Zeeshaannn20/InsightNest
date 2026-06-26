"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Course, RecordedLecture } from "@/lib/types/database";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Recordings Modal States
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [recordings, setRecordings] = useState<RecordedLecture[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recTitle, setRecTitle] = useState("");
  const [recUrl, setRecUrl] = useState("");
  const [recDuration, setRecDuration] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [isSubmittingRec, setIsSubmittingRec] = useState(false);

  const fetchRecordings = async (courseId: string) => {
    setLoadingRecs(true);
    setModalError(null);
    const { data, error } = await supabase
      .from("recorded_lectures")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true });

    if (error) {
      setModalError("Failed to load recordings: " + error.message);
    } else {
      setRecordings(data as RecordedLecture[]);
    }
    setLoadingRecs(false);
  };

  const handleOpenRecModal = (course: Course) => {
    setSelectedCourse(course);
    setIsRecModalOpen(true);
    setModalError(null);
    setModalSuccess(null);
    setRecTitle("");
    setRecUrl("");
    setRecDuration("");
    fetchRecordings(course.id);
  };

  const handleAddRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setModalError(null);
    setModalSuccess(null);

    if (!recTitle.trim() || !recUrl.trim()) {
      setModalError("Title and YouTube URL are required.");
      return;
    }

    // Validate YouTube URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = recUrl.match(regExp);
    const isValidYouTube = match && match[2].length === 11;

    if (!isValidYouTube) {
      setModalError("Please enter a valid YouTube URL.");
      return;
    }

    setIsSubmittingRec(true);

    const { data, error } = await supabase
      .from("recorded_lectures")
      .insert({
        course_id: selectedCourse.id,
        title: recTitle.trim(),
        youtube_url: recUrl.trim(),
        duration_minutes: recDuration ? parseInt(recDuration, 10) : 0
      })
      .select()
      .single();

    if (error) {
      setModalError("Failed to add recording: " + error.message);
    } else {
      setModalSuccess("Recording added successfully!");
      setRecordings([...recordings, data as RecordedLecture]);
      setRecTitle("");
      setRecUrl("");
      setRecDuration("");
    }
    setIsSubmittingRec(false);
  };

  const handleDeleteRecording = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recorded lecture?")) return;
    setModalError(null);
    setModalSuccess(null);

    const { error } = await supabase
      .from("recorded_lectures")
      .delete()
      .eq("id", id);

    if (error) {
      setModalError("Failed to delete recording: " + error.message);
    } else {
      setModalSuccess("Recording deleted successfully.");
      setRecordings(recordings.filter(r => r.id !== id));
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [supabase]);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        instructor:profiles(full_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setCourses(data as unknown as Course[]);
    }
    setLoading(false);
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !currentStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update course status.");
    } else {
      setCourses(courses.map(c => c.id === id ? { ...c, is_published: !currentStatus } : c));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Courses</h1>
          <p className="text-on-surface-variant">Manage programs, modules, and content.</p>
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
                <th className="px-6 py-4 font-semibold">Instructor</th>
                <th className="px-6 py-4 font-semibold">Price</th>
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
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                    No courses found.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-primary-container line-clamp-1">{course.title}</div>
                      <div className="text-xs text-on-surface-variant">{course.duration_weeks} Weeks</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface">{course.instructor?.full_name || "Unassigned"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-on-surface font-mono">₹{course.price}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        course.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {course.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenRecModal(course)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-secondary/15 hover:bg-secondary/25 text-secondary transition-colors"
                      >
                        Lectures
                      </button>
                      <button
                        onClick={() => handleTogglePublish(course.id, course.is_published)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
                      >
                        {course.is_published ? "Unpublish" : "Publish"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Recordings Modal */}
      {isRecModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="text-xl font-bold text-primary-container">Manage Recorded Lectures</h2>
                <p className="text-xs text-on-surface-variant mt-1">{selectedCourse.title}</p>
              </div>
              <button
                onClick={() => setIsRecModalOpen(false)}
                className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {modalError && (
                <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3 animate-shake">
                  <span className="material-symbols-outlined text-error">error</span>
                  <p className="font-medium">{modalError}</p>
                </div>
              )}

              {modalSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  <p className="font-medium">{modalSuccess}</p>
                </div>
              )}

              {/* Add New Recording Form */}
              <div className="bg-surface-container-low/40 p-4 border border-outline-variant/20 rounded-xl">
                <h3 className="text-sm font-bold text-primary-container mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Add YouTube Lecture
                </h3>
                <form onSubmit={handleAddRecording} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Lecture Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={recTitle}
                        onChange={(e) => setRecTitle(e.target.value)}
                        placeholder="e.g. Introduction to Neural Networks"
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        YouTube URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={recUrl}
                        onChange={(e) => setRecUrl(e.target.value)}
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-4 pt-1">
                    <div className="w-1/3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        Duration (Mins)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={recDuration}
                        onChange={(e) => setRecDuration(e.target.value)}
                        placeholder="e.g. 45"
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingRec}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 mt-5"
                    >
                      {isSubmittingRec && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                      <span>Add Lecture</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Recordings List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary-container flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">video_library</span>
                  Uploaded Recordings ({recordings.length})
                </h3>

                {loadingRecs ? (
                  <div className="py-8 text-center text-on-surface-variant flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                    <span className="text-sm font-medium">Loading recordings...</span>
                  </div>
                ) : recordings.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-low/20">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/50 mb-1">movie</span>
                    <p className="text-sm">No recorded lectures uploaded yet.</p>
                  </div>
                ) : (
                  <div className="border border-outline-variant/20 rounded-xl overflow-hidden divide-y divide-outline-variant/10 bg-surface-container-lowest">
                    {recordings.map((rec) => (
                      <div key={rec.id} className="p-4 flex items-center justify-between hover:bg-surface-container/20 transition-colors">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="material-symbols-outlined text-red-500 mt-0.5">play_circle</span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-on-surface truncate">{rec.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-on-surface-variant">{rec.duration_minutes || 0} mins</span>
                              <span className="text-xs text-outline">•</span>
                              <a
                                href={rec.youtube_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-secondary hover:underline flex items-center gap-0.5 truncate max-w-[200px] sm:max-w-xs"
                              >
                                {rec.youtube_url}
                                <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                              </a>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteRecording(rec.id)}
                          className="text-error hover:text-error/80 p-2 rounded-lg hover:bg-error-container/20 transition-colors ml-4 shrink-0"
                          title="Delete recording"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-outline-variant/20 flex justify-end bg-surface-container-low">
              <button
                onClick={() => setIsRecModalOpen(false)}
                className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
