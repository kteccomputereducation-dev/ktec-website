"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Loader2 } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { Course, CourseCategory } from "@/lib/types";

const emptyForm = {
  title: "",
  category_id: "",
  short_description: "",
  overview: "",
  duration: "",
  fees: "",
  eligibility: "",
  skills_learned: "",
  career_opportunities: "",
  tools_covered: "",
  certificate_info: "",
  is_published: true,
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [c, cat] = await Promise.all([
      api.get<{ courses: Course[] }>("/api/courses/admin/all"),
      api.get<{ categories: CourseCategory[] }>("/api/courses/categories"),
    ]);
    setCourses(c.courses);
    setCategories(cat.categories);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(course: Course) {
    setEditing(course);
    setForm({
      title: course.title,
      category_id: course.category_id || "",
      short_description: course.short_description || "",
      overview: course.overview || "",
      duration: course.duration || "",
      fees: course.fees ?? "",
      eligibility: course.eligibility || "",
      skills_learned: course.skills_learned || "",
      career_opportunities: course.career_opportunities || "",
      tools_covered: course.tools_covered || "",
      certificate_info: course.certificate_info || "",
      is_published: !!course.is_published,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        fees: form.fees === "" ? null : Number(form.fees),
      };
      if (editing) {
        await api.put(`/api/courses/${editing.id}`, payload);
      } else {
        await api.post("/api/courses", payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save course.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(course: Course) {
    await api.patch(`/api/courses/${course.id}/publish`, { publish: !course.is_published });
    load();
  }

  async function handleDelete(course: Course) {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    await api.delete(`/api/courses/${course.id}`);
    load();
  }

  const inputClass = "w-full border border-blueprint/20 px-3 py-2.5 text-sm focus:border-signal focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Courses</h1>
          <p className="text-sm text-slate mt-1">Manage the course catalogue</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-4 py-2.5"
        >
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div className="mt-6 bg-white border border-blueprint/10 overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-slate">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blueprint/10 text-left text-xs uppercase tracking-wider text-slate font-mono">
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Fees</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-blueprint/5 last:border-0">
                  <td className="p-4 font-medium text-ink">{c.title}</td>
                  <td className="p-4 text-slate">{c.category_name || "—"}</td>
                  <td className="p-4 font-mono text-xs text-slate">{c.duration || "—"}</td>
                  <td className="p-4 font-mono text-xs text-slate">{c.fees ? `₹${c.fees}` : "—"}</td>
                  <td className="p-4">
                    <span
                      className={`font-mono text-xs px-2 py-1 ${
                        c.is_published ? "bg-signal/10 text-signal" : "bg-slate/10 text-slate"
                      }`}
                    >
                      {c.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => togglePublish(c)} title={c.is_published ? "Unpublish" : "Publish"}>
                        {c.is_published ? (
                          <EyeOff size={16} className="text-slate hover:text-ink" />
                        ) : (
                          <Eye size={16} className="text-slate hover:text-ink" />
                        )}
                      </button>
                      <button onClick={() => openEdit(c)} title="Edit">
                        <Pencil size={16} className="text-slate hover:text-blueprint" />
                      </button>
                      <button onClick={() => handleDelete(c)} title="Delete">
                        <Trash2 size={16} className="text-slate hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-slate">
                    No courses yet. Click &ldquo;Add Course&rdquo; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-start justify-center overflow-y-auto p-5">
          <div className="bg-white max-w-2xl w-full mt-10 mb-10">
            <div className="flex items-center justify-between border-b border-blueprint/10 p-5">
              <h2 className="font-display font-semibold text-ink">{editing ? "Edit Course" : "Add Course"}</h2>
              <button onClick={() => setModalOpen(false)}>
                <X size={20} className="text-slate" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <input
                required
                placeholder="Course Title *"
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className={inputClass}
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Duration (e.g. 2 Months)"
                  className={inputClass}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <input
                type="number"
                placeholder="Fees (₹) — leave blank for 'Enquire for fees'"
                className={inputClass}
                value={form.fees}
                onChange={(e) => setForm({ ...form, fees: e.target.value })}
              />
              <textarea
                placeholder="Short Description"
                className={`${inputClass} h-20`}
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              />
              <textarea
                placeholder="Course Overview"
                className={`${inputClass} h-24`}
                value={form.overview}
                onChange={(e) => setForm({ ...form, overview: e.target.value })}
              />
              <textarea
                placeholder="Eligibility / Who can join?"
                className={`${inputClass} h-20`}
                value={form.eligibility}
                onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
              />
              <textarea
                placeholder="Skills Learned (comma or newline separated)"
                className={`${inputClass} h-20`}
                value={form.skills_learned}
                onChange={(e) => setForm({ ...form, skills_learned: e.target.value })}
              />
              <textarea
                placeholder="Career Opportunities (comma or newline separated)"
                className={`${inputClass} h-20`}
                value={form.career_opportunities}
                onChange={(e) => setForm({ ...form, career_opportunities: e.target.value })}
              />
              <input
                placeholder="Software / Tools Covered (comma separated)"
                className={inputClass}
                value={form.tools_covered}
                onChange={(e) => setForm({ ...form, tools_covered: e.target.value })}
              />
              <textarea
                placeholder="Certificate Information"
                className={`${inputClass} h-16`}
                value={form.certificate_info}
                onChange={(e) => setForm({ ...form, certificate_info: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                />
                Published (visible on the public site)
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm text-slate">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white text-sm font-semibold px-5 py-2.5"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />} Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
