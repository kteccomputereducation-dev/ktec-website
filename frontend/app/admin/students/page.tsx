"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Loader2, X } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", qualification: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const data = await api.get<{ students: any[] }>(`/api/students?${params.toString()}`);
    setStudents(data.students);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/api/students", form);
      setModalOpen(false);
      setForm({ full_name: "", email: "", phone: "", password: "", qualification: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add student.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Students</h1>
          <p className="text-sm text-slate mt-1">Manage student records and course assignments</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-4 py-2.5"
        >
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
        <input
          placeholder="Search students…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-blueprint/20 pl-9 pr-3 py-2.5 text-sm focus:border-signal focus:outline-none"
        />
      </div>

      <div className="mt-6 bg-white border border-blueprint/10 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-slate">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blueprint/10 text-left text-xs uppercase tracking-wider text-slate font-mono">
                <th className="p-4">Student Code</th>
                <th className="p-4">Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Qualification</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-blueprint/5 last:border-0">
                  <td className="p-4 font-mono text-xs text-slate">{s.student_code}</td>
                  <td className="p-4 font-medium text-ink">{s.full_name}</td>
                  <td className="p-4 text-slate text-xs">{s.email}<br />{s.phone}</td>
                  <td className="p-4 text-slate">{s.qualification || "—"}</td>
                  <td className="p-4">
                    <span className="font-mono text-xs px-2 py-1 bg-signal/10 text-signal">{s.status}</span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-slate">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-start justify-center overflow-y-auto p-5">
          <div className="bg-white max-w-md w-full mt-16">
            <div className="flex items-center justify-between border-b border-blueprint/10 p-5">
              <h2 className="font-display font-semibold text-ink">Add Student</h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-slate" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <input
                required
                placeholder="Full Name"
                className={inputClass}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                required
                placeholder="Phone"
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                placeholder="Qualification"
                className={inputClass}
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              />
              <input
                required
                type="password"
                placeholder="Temporary Password (min. 8 chars)"
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold py-2.5"
              >
                {saving && <Loader2 size={14} className="animate-spin" />} Add Student
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
