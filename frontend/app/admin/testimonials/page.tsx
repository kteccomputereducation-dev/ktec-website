"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { Course } from "@/lib/types";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ student_name: "", course_id: "", review: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [t, c] = await Promise.all([
      api.get<{ testimonials: any[] }>("/api/testimonials/admin/all"),
      api.get<{ courses: Course[] }>("/api/courses/admin/all"),
    ]);
    setItems(t.testimonials);
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
      await api.post("/api/testimonials", { ...form, is_published: true });
      setModalOpen(false);
      setForm({ student_name: "", course_id: "", review: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add testimonial.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(item: any) {
    await api.put(`/api/testimonials/${item.id}`, { is_published: !item.is_published });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await api.delete(`/api/testimonials/${id}`);
    load();
  }

  const inputClass = "w-full border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Testimonials</h1>
          <p className="text-sm text-slate mt-1">
            Add real student testimonials only. Use placeholder text just for development previews.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-4 py-2.5"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-slate">Loading…</p>}
        {items.map((t) => (
          <div key={t.id} className="bg-white border border-blueprint/10 p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm text-ink">{t.student_name}</p>
              <p className="mt-1 text-sm text-slate">{t.review}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => togglePublish(t)} title={t.is_published ? "Unpublish" : "Publish"}>
                {t.is_published ? (
                  <ToggleRight size={22} className="text-signal" />
                ) : (
                  <ToggleLeft size={22} className="text-slate" />
                )}
              </button>
              <button onClick={() => remove(t.id)}>
                <Trash2 size={16} className="text-slate hover:text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-start justify-center overflow-y-auto p-5">
          <div className="bg-white max-w-md w-full mt-16">
            <div className="flex items-center justify-between border-b border-blueprint/10 p-5">
              <h2 className="font-display font-semibold text-ink">Add Testimonial</h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-slate" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <input
                required
                placeholder="Student Name"
                className={inputClass}
                value={form.student_name}
                onChange={(e) => setForm({ ...form, student_name: e.target.value })}
              />
              <select
                className={inputClass}
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              >
                <option value="">No Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <textarea
                required
                placeholder="Review"
                className={`${inputClass} h-24`}
                value={form.review}
                onChange={(e) => setForm({ ...form, review: e.target.value })}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold py-2.5"
              >
                {saving && <Loader2 size={14} className="animate-spin" />} Add Testimonial
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
