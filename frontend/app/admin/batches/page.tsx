"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { Course } from "@/lib/types";

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    course_id: "",
    batch_code: "",
    start_date: "",
    end_date: "",
    timing: "",
    mode: "offline",
    capacity: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [b, c] = await Promise.all([
      api.get<{ batches: any[] }>("/api/batches"),
      api.get<{ courses: Course[] }>("/api/courses/admin/all"),
    ]);
    setBatches(b.batches);
    setCourses(c.courses);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/api/batches", { ...form, capacity: form.capacity ? Number(form.capacity) : null });
      setModalOpen(false);
      setForm({ course_id: "", batch_code: "", start_date: "", end_date: "", timing: "", mode: "offline", capacity: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create batch.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Batches</h1>
          <p className="text-sm text-slate mt-1">Manage course batches, timing and trainers</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-4 py-2.5"
        >
          <Plus size={16} /> Add Batch
        </button>
      </div>

      <div className="mt-6 bg-white border border-blueprint/10 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-slate">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blueprint/10 text-left text-xs uppercase tracking-wider text-slate font-mono">
                <th className="p-4">Batch Code</th>
                <th className="p-4">Course</th>
                <th className="p-4">Timing</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Students</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b border-blueprint/5 last:border-0">
                  <td className="p-4 font-mono text-xs text-ink">{b.batch_code}</td>
                  <td className="p-4 text-charcoal">{b.course_title}</td>
                  <td className="p-4 text-slate">{b.timing || "—"}</td>
                  <td className="p-4 text-slate capitalize">{b.mode}</td>
                  <td className="p-4 font-mono text-xs text-slate">{b.student_count}</td>
                  <td className="p-4">
                    <span className="font-mono text-xs px-2 py-1 bg-blueprint/10 text-blueprint capitalize">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-slate">
                    No batches yet.
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
              <h2 className="font-display font-semibold text-ink">Add Batch</h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-slate" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <select
                required
                className={inputClass}
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">Select Course *</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Batch Code (e.g. PY-EVE-01)"
                className={inputClass}
                value={form.batch_code}
                onChange={(e) => setForm({ ...form, batch_code: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className={inputClass}
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
                <input
                  type="date"
                  className={inputClass}
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
              <input
                placeholder="Timing (e.g. Mon-Fri 6-8 PM)"
                className={inputClass}
                value={form.timing}
                onChange={(e) => setForm({ ...form, timing: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={inputClass}
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <input
                  type="number"
                  placeholder="Capacity"
                  className={inputClass}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold py-2.5"
              >
                {saving && <Loader2 size={14} className="animate-spin" />} Create Batch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
