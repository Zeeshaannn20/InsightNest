"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fake data for charts since we don't have enough real data yet
  // In a real app, this would be computed from Supabase queries
  const enrollmentData = [
    { name: 'Jan', students: 12 },
    { name: 'Feb', students: 19 },
    { name: 'Mar', students: 30 },
    { name: 'Apr', students: 45 },
    { name: 'May', students: 60 },
    { name: 'Jun', students: 85 },
  ];

  const attendanceData = [
    { name: 'Session 1', present: 80, absent: 5, late: 15 },
    { name: 'Session 2', present: 85, absent: 10, late: 5 },
    { name: 'Session 3', present: 90, absent: 2, late: 8 },
    { name: 'Session 4', present: 75, absent: 15, late: 10 },
  ];

  const submissionData = [
    { name: 'Graded', value: 65 },
    { name: 'Pending Review', value: 20 },
    { name: 'Late', value: 10 },
    { name: 'Not Submitted', value: 5 },
  ];

  const COLORS = ['#4355b9', '#8596ff', '#e5eeff', '#ba1a1a'];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-container tracking-tight mb-2">Analytics</h1>
          <p className="text-on-surface-variant">Platform performance and student engagement metrics.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-secondary">
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <button className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-on-surface-variant hover:text-secondary transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Enrollment Trends */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primary-container">Student Enrollment Growth</h3>
              <p className="text-sm text-on-surface-variant">Cumulative active students over time</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45474d' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45474d' }} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="students" stroke="#4355b9" strokeWidth={3} dot={{ r: 4, fill: '#4355b9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Breakdown */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primary-container">Live Session Attendance</h3>
              <p className="text-sm text-on-surface-variant">Participation rates per session</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5eeff" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45474d' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#45474d' }} dx={-10} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#f8f9ff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="present" name="Present (%)" stackId="a" fill="#4355b9" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="late" name="Late (%)" stackId="a" fill="#8596ff" />
                  <Bar dataKey="absent" name="Absent (%)" stackId="a" fill="#dce9ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assignment Submission Status */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primary-container">Assignment Status Overview</h3>
              <p className="text-sm text-on-surface-variant">Current state of all active assignments</p>
            </div>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={submissionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {submissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#101c2f', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-primary-container">Key Performance Indicators</h3>
              <p className="text-sm text-on-surface-variant">Overall platform health</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Avg Completion</span>
                <span className="text-3xl font-bold text-secondary">78%</span>
                <span className="text-xs text-green-600 font-medium mt-1 flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span> +5.2% vs last month</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Avg Quiz Score</span>
                <span className="text-3xl font-bold text-secondary">82/100</span>
                <span className="text-xs text-green-600 font-medium mt-1 flex items-center"><span className="material-symbols-outlined text-[14px]">trending_up</span> +1.8% vs last month</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-center">
                <span className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Active Rate</span>
                <span className="text-3xl font-bold text-secondary">94%</span>
                <span className="text-xs text-on-surface-variant font-medium mt-1 flex items-center">Students logging in weekly</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-center border border-secondary/20 bg-secondary/5">
                <span className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Platform Health</span>
                <span className="text-3xl font-bold text-green-600 flex items-center gap-2">Excellent <span className="material-symbols-outlined text-[28px]">verified</span></span>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
