"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  BookOpen,
  CalendarCheck,
  FileText,
  Award,
  Megaphone,
  LogOut,
  Loader2,
  Download,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, fileUrl } from "@/lib/api";

type Tab = "profile" | "courses" | "attendance" | "materials" | "certificates" | "announcements";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "materials", label: "Study Materials", icon: FileText },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-blueprint" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome, {user.full_name.split(" ")[0]}</h1>
          <p className="text-sm text-slate mt-1">Student Dashboard</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate hover:text-red-600"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap text-left transition-colors ${
                tab === id ? "bg-blueprint text-white" : "text-charcoal hover:bg-white"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        <div className="bg-white border border-blueprint/10 p-6 min-h-[320px]">
          {tab === "profile" && <ProfileTab />}
          {tab === "courses" && <CoursesTab />}
          {tab === "attendance" && <AttendanceTab />}
          {tab === "materials" && <MaterialsTab />}
          {tab === "certificates" && <CertificatesTab />}
          {tab === "announcements" && <AnnouncementsTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ phone: "", address: "", guardian_name: "", guardian_phone: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<{ profile: any }>("/api/students/me/profile").then((d) => {
      setProfile(d.profile);
      setForm({
        phone: d.profile.phone || "",
        address: d.profile.address || "",
        guardian_name: d.profile.guardian_name || "",
        guardian_phone: d.profile.guardian_phone || "",
      });
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.put("/api/students/me/profile", form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) return <p className="text-sm text-slate">Loading…</p>;

  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-ink">My Profile</h2>
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <Info label="Full Name" value={profile.full_name} />
        <Info label="Student Code" value={profile.student_code} mono />
        <Info label="Email" value={profile.email} />
        <Info label="Status" value={profile.status} />
      </dl>

      <form onSubmit={handleSave} className="mt-6 border-t border-blueprint/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <FormField label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <FormField label="Guardian Name" value={form.guardian_name} onChange={(v) => setForm({ ...form, guardian_name: v })} />
        <FormField label="Guardian Phone" value={form.guardian_phone} onChange={(v) => setForm({ ...form, guardian_phone: v })} />
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-5 py-2.5"
          >
            {saving && <Loader2 size={14} className="animate-spin" />} Save Changes
          </button>
          {saved && <span className="ml-3 text-sm text-signal">Saved.</span>}
        </div>
      </form>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-wider text-slate">{label}</dt>
      <dd className={`mt-1 text-charcoal ${mono ? "font-mono" : ""}`}>{value || "—"}</dd>
    </div>
  );
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="font-mono text-xs uppercase tracking-wider text-slate">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none"
      />
    </label>
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => {
    api.get<{ courses: any[] }>("/api/students/me/courses").then((d) => setCourses(d.courses));
  }, []);
  if (courses.length === 0) return <EmptyState text="You are not enrolled in any courses yet." />;
  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-ink mb-4">My Courses</h2>
      <div className="space-y-3">
        {courses.map((c) => (
          <div key={c.enrollment_id} className="border border-blueprint/10 p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-sm text-ink">{c.course_title}</p>
              <p className="font-mono text-xs text-slate mt-1">
                {c.batch_code ? `Batch ${c.batch_code}` : "No batch assigned"} · {c.status}
              </p>
            </div>
            <div className="w-32">
              <div className="h-2 bg-paper-dim overflow-hidden">
                <div className="h-full bg-signal" style={{ width: `${c.progress_percent || 0}%` }} />
              </div>
              <p className="mt-1 font-mono text-xs text-slate text-right">{c.progress_percent || 0}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceTab() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.get<any>("/api/students/me/attendance").then(setData);
  }, []);
  if (!data) return <p className="text-sm text-slate">Loading…</p>;
  if (data.attendance.length === 0) return <EmptyState text="No attendance records yet." />;
  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-ink mb-2">Attendance</h2>
      <p className="text-sm text-slate mb-4">
        {data.summary.present} / {data.summary.total} sessions present ({data.summary.percentage}%)
      </p>
      <div className="divide-y divide-blueprint/10">
        {data.attendance.map((a: any, i: number) => (
          <div key={i} className="flex justify-between py-2.5 text-sm">
            <span className="text-charcoal">{a.course_title} · {a.session_date}</span>
            <span
              className={`font-mono text-xs uppercase ${
                a.status === "present" ? "text-signal" : a.status === "late" ? "text-draft-dark" : "text-red-500"
              }`}
            >
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaterialsTab() {
  const [materials, setMaterials] = useState<any[]>([]);
  useEffect(() => {
    api.get<{ materials: any[] }>("/api/students/me/materials").then((d) => setMaterials(d.materials));
  }, []);
  if (materials.length === 0) return <EmptyState text="No study materials assigned yet." />;
  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-ink mb-4">Study Materials</h2>
      <div className="space-y-2">
        {materials.map((m) => (
          <a
            key={m.id}
            href={fileUrl(m.file_url) || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-blueprint/10 p-4 hover:border-signal transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-ink">{m.title}</p>
              <p className="font-mono text-xs text-slate mt-1">{m.course_title}</p>
            </div>
            <Download size={16} className="text-blueprint" />
          </a>
        ))}
      </div>
    </div>
  );
}

function CertificatesTab() {
  const [certs, setCerts] = useState<any[]>([]);
  useEffect(() => {
    api.get<{ certificates: any[] }>("/api/students/me/certificates").then((d) => setCerts(d.certificates));
  }, []);
  if (certs.length === 0) return <EmptyState text="No certificates issued yet." />;
  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-ink mb-4">Certificates</h2>
      <div className="space-y-2">
        {certs.map((c) => (
          <div key={c.certificate_number} className="flex items-center justify-between border border-blueprint/10 p-4">
            <div>
              <p className="text-sm font-medium text-ink">{c.course_title}</p>
              <p className="font-mono text-xs text-slate mt-1">{c.certificate_number} · Issued {c.issued_date}</p>
            </div>
            {c.file_url && (
              <a href={fileUrl(c.file_url) || "#"} target="_blank" rel="noopener noreferrer">
                <Download size={16} className="text-blueprint" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsTab() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api.get<{ announcements: any[] }>("/api/students/me/announcements").then((d) => setItems(d.announcements));
  }, []);
  if (items.length === 0) return <EmptyState text="No announcements right now." />;
  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-ink mb-4">Announcements</h2>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="border border-blueprint/10 p-4">
            <p className="font-medium text-sm text-ink">{a.title}</p>
            <p className="mt-1 text-sm text-slate">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-slate">{text}</p>;
}
