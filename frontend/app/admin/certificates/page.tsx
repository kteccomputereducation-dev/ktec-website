"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Ban } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { Course } from "@/lib/types";

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", course_id: "", issued_date: "", certificate_number: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [cert, st, co] = await Promise.all([
      api.get<{ certificates: any[] }>("/api/certificates"),
      api.get<{ students: any[] }>("/api/students"),
      api.get<{ courses: Course[] }>("/api/courses/admin/all"),
    ]);
    setCerts(cert.certificates);
    setStudents(st.students);
    setCourses(co.courses);
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
      await api.post("/api/certificates", form);
      setModalOpen(false);
      setForm({ student_id: "", course_id: "", issued_date: "", certificate_number: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not issue certificate.");
    } finally {
      setSaving(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this certificate? It will fail public verification.")) return;
    await api.patch(`/api/certificates/${id}/revoke`);
    load();
  }

  const inputClass = "w-full border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Certificates</h1>
          <p className="text-sm text-slate mt-1">Issue and manage student certificates</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-4 py-2.5"
        >
          <Plus size={16} /> Issue Certificate
        </button>
      </div>

      <div className="mt-6 bg-white border border-blueprint/10 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-slate">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blueprint/10 text-left text-xs uppercase tracking-wider text-slate font-mono">
                <th className="p-4">Certificate #</th>
                <th className="p-4">Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Issued</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id} className="border-b border-blueprint/5 last:border-0">
                  <td className="p-4 font-mono text-xs text-ink">{c.certificate_number}</td>
                  <td className="p-4 text-charcoal">{c.student_name}</td>
                  <td className="p-4 text-slate">{c.course_title}</td>
                  <td className="p-4 font-mono text-xs text-slate">{c.issued_date}</td>
                  <td className="p-4">
                    <span
                      className={`font-mono text-xs px-2 py-1 ${
                        c.status === "issued" ? "bg-signal/10 text-signal" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {c.status === "issued" && (
                      <button onClick={() => revoke(c.id)} title="Revoke">
                        <Ban size={16} className="text-slate hover:text-red-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-slate">
                    No certificates issued yet.
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
              <h2 className="font-display font-semibold text-ink">Issue Certificate</h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-slate" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <select
                required
                className={inputClass}
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              >
                <option value="">Select Student *</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.student_code})
                  </option>
                ))}
              </select>
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
                type="date"
                className={inputClass}
                value={form.issued_date}
                onChange={(e) => setForm({ ...form, issued_date: e.target.value })}
              />
              <input
                placeholder="Certificate Number (auto-generated if blank)"
                className={inputClass}
                value={form.certificate_number}
                onChange={(e) => setForm({ ...form, certificate_number: e.target.value })}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold py-2.5"
              >
                {saving && <Loader2 size={14} className="animate-spin" />} Issue Certificate
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
