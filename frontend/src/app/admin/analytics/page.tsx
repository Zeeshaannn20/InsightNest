"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from "recharts";

type Range = "30d" | "3m" | "year" | "all";

const RANGE_LABELS: Record<Range, string> = {
  "30d": "Last 30 Days",
  "3m": "Last 3 Months",
  year: "This Year",
  all: "All Time",
};

function rangeStart(range: Range): Date | null {
  const now = new Date();
  switch (range) {
    case "30d": return new Date(now.getTime() - 30 * 864e5);
    case "3m": return new Date(now.getTime() - 90 * 864e5);
    case "year": return new Date(now.getFullYear(), 0, 1);
    case "all": return null;
  }
}

const rupees = (paise: number) =>
  `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-72 w-full flex flex-col items-center justify-center text-on-surface-variant">
      <span className="material-symbols-outlined text-4xl text-outline mb-2">bar_chart</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("all");

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState({ total: 0, active: 0 });
  const [waitlistPending, setWaitlistPending] = useState<number | null>(null);

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [enrRes, attRes, profRes, waitRes] = await Promise.all([
      supabase
        .from("enrollments")
        .select("enrolled_at, progress_pct, status, source, course_id, course:courses(title, price_paise)"),
      supabase
        .from("attendance")
        .select("status, session_id, session:live_sessions(title, session_date)"),
      supabase.from("profiles").select("is_active").eq("role", "student"),
      // waitlist may not exist yet if its migration hasn't run
      supabase.from("waitlist").select("status"),
    ]);

    if (enrRes.error) setError(enrRes.error.message);

    setEnrollments(enrRes.data ?? []);
    setAttendance(attRes.data ?? []);
    setStudentCount({
      total: profRes.data?.length ?? 0,
      active: profRes.data?.filter((p: any) => p.is_active).length ?? 0,
    });
    setWaitlistPending(
      waitRes.error ? null : (waitRes.data ?? []).filter((w: any) => w.status === "pending").length
    );

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const inRange = useMemo(() => {
    const start = rangeStart(range);
    if (!start) return enrollments;
    return enrollments.filter((e) => new Date(e.enrolled_at) >= start);
  }, [enrollments, range]);

  /** Cumulative enrolments per month. */
  const growth = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const e of inRange) {
      const d = new Date(e.enrolled_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    }
    let running = 0;
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        running += count;
        const [y, m] = key.split("-");
        return {
          name: new Date(Number(y), Number(m) - 1).toLocaleString("en", { month: "short", year: "2-digit" }),
          students: running,
          joined: count,
        };
      });
  }, [inRange]);

  /** Present / late / absent per live session. */
  const attendanceBySession = useMemo(() => {
    const bySession = new Map<string, { name: string; present: number; late: number; absent: number }>();
    for (const a of attendance) {
      const key = a.session_id;
      const entry =
        bySession.get(key) ?? { name: a.session?.title ?? "Session", present: 0, late: 0, absent: 0 };
      if (a.status === "present") entry.present++;
      else if (a.status === "late") entry.late++;
      else entry.absent++;
      bySession.set(key, entry);
    }
    return [...bySession.values()].slice(-8);
  }, [attendance]);

  /** Enrolments split by how they were acquired, per course. */
  const byCourse = useMemo(() => {
    const map = new Map<string, { name: string; razorpay: number; manual: number }>();
    for (const e of inRange) {
      const title = e.course?.title ?? "Unknown course";
      const entry = map.get(title) ?? { name: title, razorpay: 0, manual: 0 };
      if (e.source === "razorpay") entry.razorpay++;
      else entry.manual++;
      map.set(title, entry);
    }
    return [...map.values()];
  }, [inRange]);

  const kpis = useMemo(() => {
    const paid = inRange.filter((e) => e.source === "razorpay");
    const revenuePaise = paid.reduce((sum, e) => sum + Number(e.course?.price_paise ?? 0), 0);
    const avgCompletion = inRange.length
      ? Math.round(inRange.reduce((s, e) => s + Number(e.progress_pct ?? 0), 0) / inRange.length)
      : 0;
    const completed = inRange.filter((e) => e.status === "completed").length;
    return { revenuePaise, avgCompletion, completed, paidCount: paid.length };
  }, [inRange]);

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Range", RANGE_LABELS[range]],
      ["Enrollments", String(inRange.length)],
      ["Paid enrollments", String(kpis.paidCount)],
      ["Estimated revenue (INR)", String(Math.round(kpis.revenuePaise / 100))],
      ["Average completion (%)", String(kpis.avgCompletion)],
      ["Completed courses", String(kpis.completed)],
      ["Students (total)", String(studentCount.total)],
      ["Students (active)", String(studentCount.active)],
      ["Waitlist pending", waitlistPending == null ? "n/a" : String(waitlistPending)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `insightnest-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const chartCard = "bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm";

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Analytics</h1>
          <p className="text-on-surface-variant">Platform performance and student engagement metrics.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-secondary"
          >
            {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
              <option key={r} value={r}>{RANGE_LABELS[r]}</option>
            ))}
          </select>
          <button
            onClick={exportCsv}
            title="Export summary as CSV"
            className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface-variant hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Enrollment growth */}
          <div className={chartCard}>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primary-container">Student Enrollment Growth</h3>
              <p className="text-sm text-on-surface-variant">Cumulative enrollments over time</p>
            </div>
            {growth.length === 0 ? (
              <EmptyChart message="No enrollments in this period yet." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45474d' }} dy={10} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45474d' }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="students" name="Total enrolled" stroke="#4355b9" strokeWidth={3} dot={{ r: 4, fill: '#4355b9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className={chartCard}>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primary-container">Live Session Attendance</h3>
              <p className="text-sm text-on-surface-variant">Attendees per session</p>
            </div>
            {attendanceBySession.length === 0 ? (
              <EmptyChart message="No attendance recorded yet." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceBySession} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#45474d' }} dy={10} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45474d' }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} cursor={{ fill: '#f8f9ff' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="present" name="Present" stackId="a" fill="#4355b9" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="late" name="Late" stackId="a" fill="#8596ff" />
                    <Bar dataKey="absent" name="Absent" stackId="a" fill="#dce9ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Enrollments by course & acquisition */}
          <div className={chartCard}>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primary-container">Enrollments by Course</h3>
              <p className="text-sm text-on-surface-variant">Paid checkout versus manual grant</p>
            </div>
            {byCourse.length === 0 ? (
              <EmptyChart message="No enrollments to break down yet." />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCourse} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#45474d' }} dy={10} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45474d' }} dx={-10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} cursor={{ fill: '#f8f9ff' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="razorpay" name="Razorpay" stackId="a" fill="#4355b9" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="manual" name="Manual grant" stackId="a" fill="#8596ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className={`${chartCard} flex flex-col`}>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primary-container">Key Performance Indicators</h3>
              <p className="text-sm text-on-surface-variant">{RANGE_LABELS[range]}</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Revenue</span>
                <span className="text-3xl font-bold text-secondary tabular-nums">{rupees(kpis.revenuePaise)}</span>
                <span className="text-xs text-on-surface-variant font-medium mt-1">
                  {kpis.paidCount} paid enrollment{kpis.paidCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Avg Completion</span>
                <span className="text-3xl font-bold text-secondary tabular-nums">{kpis.avgCompletion}%</span>
                <span className="text-xs text-on-surface-variant font-medium mt-1">
                  {kpis.completed} course{kpis.completed === 1 ? "" : "s"} finished
                </span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Students</span>
                <span className="text-3xl font-bold text-secondary tabular-nums">{studentCount.total}</span>
                <span className="text-xs text-on-surface-variant font-medium mt-1">
                  {studentCount.active} active
                </span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-center border border-secondary/20 bg-secondary/5">
                <span className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Waitlist</span>
                <span className="text-3xl font-bold text-secondary tabular-nums">
                  {waitlistPending == null ? "—" : waitlistPending}
                </span>
                <span className="text-xs text-on-surface-variant font-medium mt-1">
                  {waitlistPending == null ? "Table not created yet" : "Awaiting a decision"}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-outline mt-4">
              Revenue is estimated from each course&apos;s current price, since historical prices are
              not stored per enrollment.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
