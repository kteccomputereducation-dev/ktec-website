"use client";

import { useEffect, useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
import { Course } from "@/lib/types";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function EnquiryForm({
  defaultCourseId,
  compact = false,
}: {
  defaultCourseId?: string;
  compact?: boolean;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    student_name: "",
    mobile: "",
    email: "",
    course_id: defaultCourseId || "",
    qualification: "",
    preferred_batch: "",
    preferred_mode: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api
      .get<{ courses: Course[] }>("/api/courses")
      .then((d) => setCourses(d.courses))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting" || status === "success") return; // guard against double-submit
    setStatus("submitting");
    setErrorMsg("");
    try {
      await api.post("/api/enquiries", form);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-signal/30 p-8 text-center">
        <CheckCircle2 className="mx-auto text-signal" size={40} />
        <h3 className="mt-4 font-display text-xl font-semibold text-ink">Enquiry received</h3>
        <p className="mt-2 text-slate text-sm">
          Thank you! Our team will contact you shortly to guide you through the next steps.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full border border-blueprint/20 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-slate/60 focus:border-signal focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className={`bg-white border border-blueprint/10 p-6 ${compact ? "" : "md:p-8"}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          required
          placeholder="Student Name *"
          className={inputClass}
          value={form.student_name}
          onChange={(e) => setForm({ ...form, student_name: e.target.value })}
        />
        <input
          required
          placeholder="Mobile Number *"
          className={inputClass}
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className={inputClass}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <select
          className={inputClass}
          value={form.course_id}
          onChange={(e) => setForm({ ...form, course_id: e.target.value })}
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <input
          placeholder="Qualification"
          className={inputClass}
          value={form.qualification}
          onChange={(e) => setForm({ ...form, qualification: e.target.value })}
        />
        <input
          placeholder="Preferred Batch (e.g. Morning / Evening)"
          className={inputClass}
          value={form.preferred_batch}
          onChange={(e) => setForm({ ...form, preferred_batch: e.target.value })}
        />
        <select
          className={inputClass}
          value={form.preferred_mode}
          onChange={(e) => setForm({ ...form, preferred_mode: e.target.value })}
        >
          <option value="">Preferred Learning Mode</option>
          <option value="offline">Classroom (Offline)</option>
          <option value="online">Online</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <input
          placeholder="Message"
          className={`${inputClass} md:col-span-2`}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blueprint hover:bg-blueprint-dark disabled:opacity-60 text-white font-display font-semibold px-8 py-3 transition-colors"
      >
        {status === "submitting" && <Loader2 size={16} className="animate-spin" />}
        Submit Enquiry
      </button>
    </form>
  );
}
