"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, BookOpen, Inbox, Layers, GraduationCap, UserCheck } from "lucide-react";
import { api } from "@/lib/api";

const PIE_COLORS = ["#1B3E6F", "#0EA5B3", "#E3A73E", "#5B6B7A", "#2A5590"];

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get<any>("/api/dashboard/stats").then(setData);
  }, []);

  if (!data) return <p className="text-sm text-slate">Loading dashboard…</p>;

  const { stats, enquiryTrend, enquiryByStatus } = data;

  const cards = [
    { label: "Total Students", value: stats.total_students, icon: Users },
    { label: "Active Students", value: stats.active_students, icon: UserCheck },
    { label: "Total Courses", value: stats.total_courses, icon: BookOpen },
    { label: "Published Courses", value: stats.published_courses, icon: GraduationCap },
    { label: "Total Enquiries", value: stats.total_enquiries, icon: Inbox },
    { label: "New Enquiries", value: stats.new_enquiries, icon: Inbox },
    { label: "Total Admissions", value: stats.total_admissions, icon: GraduationCap },
    { label: "Total Batches", value: stats.total_batches, icon: Layers },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
      <p className="text-sm text-slate mt-1">Overview of K TEC Computer Education</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-blueprint/10 p-4">
            <Icon size={18} className="text-blueprint" />
            <p className="mt-3 font-mono text-2xl font-semibold text-ink">{value}</p>
            <p className="mt-1 text-xs text-slate">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-blueprint/10 p-5">
          <h2 className="font-display font-semibold text-sm text-ink mb-4">Enquiries — Last 6 Months</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={enquiryTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#5B6B7A" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#5B6B7A" />
              <Tooltip />
              <Bar dataKey="count" fill="#1B3E6F" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-blueprint/10 p-5">
          <h2 className="font-display font-semibold text-sm text-ink mb-4">Enquiries by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={enquiryByStatus} dataKey="count" nameKey="status" outerRadius={85} label>
                {enquiryByStatus.map((entry: any, index: number) => (
                  <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
