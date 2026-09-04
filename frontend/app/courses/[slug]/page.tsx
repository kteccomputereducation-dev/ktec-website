import { notFound } from "next/navigation";
import { CheckCircle2, Download, FileText } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { Course, CourseModule, CourseFaq } from "@/lib/types";
import EnquiryForm from "@/components/EnquiryForm";

async function getCourse(slug: string) {
  try {
    return await api.get<{ course: Course; modules: CourseModule[]; faqs: CourseFaq[] }>(
      `/api/courses/${slug}`
    );
  } catch {
    return null;
  }
}

function splitList(text?: string) {
  if (!text) return [];
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const data = await getCourse(params.slug);
  if (!data) return notFound();

  const { course, modules, faqs } = data;
  const skills = splitList(course.skills_learned);
  const careers = splitList(course.career_opportunities);
  const tools = splitList(course.tools_covered);

  return (
    <div>
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 py-14">
          <span className="font-mono text-xs tracking-widest uppercase text-signal">
            {course.category_name || "Course"}
          </span>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink">
            {course.title}
          </h1>
          <p className="mt-4 text-slate leading-relaxed max-w-2xl">{course.short_description}</p>

          <div className="mt-6 flex flex-wrap gap-6 font-mono text-sm text-charcoal">
            <span>DURATION&nbsp;&nbsp;{course.duration || "—"}</span>
            <span>FEES&nbsp;&nbsp;{course.fees ? `₹${course.fees.toLocaleString("en-IN")}` : "Enquire for fees"}</span>
          </div>

          {course.brochure_url && (
            <a
              href={fileUrl(course.brochure_url) || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border border-blueprint text-blueprint hover:bg-blueprint hover:text-white transition-colors px-5 py-2.5 text-sm font-semibold"
            >
              <Download size={16} /> Download Course Brochure
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {course.overview && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Course Overview</h2>
              <p className="mt-3 text-sm text-slate leading-relaxed whitespace-pre-line">{course.overview}</p>
            </div>
          )}

          {course.eligibility && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Who Can Join?</h2>
              <p className="mt-3 text-sm text-slate leading-relaxed whitespace-pre-line">{course.eligibility}</p>
            </div>
          )}

          {modules.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Course Modules</h2>
              <ol className="mt-4 space-y-3">
                {modules.map((m, i) => (
                  <li key={m.id} className="flex gap-3 bg-white border border-blueprint/10 p-4">
                    <span className="font-mono text-signal text-sm shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-medium text-sm text-ink">{m.title}</p>
                      {m.description && <p className="mt-1 text-xs text-slate">{m.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tools.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Software / Tools Covered</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {tools.map((t) => (
                  <span key={t} className="font-mono text-xs border border-blueprint/20 px-3 py-1.5 text-charcoal">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Skills You'll Learn</h2>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {skills.map((s) => (
                  <li key={s} className="flex gap-2 text-sm text-charcoal">
                    <CheckCircle2 size={16} className="text-signal shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {careers.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Career Opportunities</h2>
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {careers.map((c) => (
                  <li key={c} className="flex gap-2 text-sm text-charcoal">
                    <CheckCircle2 size={16} className="text-signal shrink-0 mt-0.5" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.certificate_info && (
            <div className="flex gap-3 bg-white border border-blueprint/10 p-5">
              <FileText size={20} className="text-blueprint shrink-0" />
              <div>
                <h3 className="font-display font-semibold text-sm text-ink">Certificate</h3>
                <p className="mt-1 text-sm text-slate">{course.certificate_info}</p>
              </div>
            </div>
          )}

          {faqs.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Frequently Asked Questions</h2>
              <div className="mt-4 space-y-3">
                {faqs.map((f) => (
                  <details key={f.id} className="bg-white border border-blueprint/10 p-4 group">
                    <summary className="font-medium text-sm text-ink cursor-pointer">{f.question}</summary>
                    <p className="mt-2 text-sm text-slate leading-relaxed">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="font-display font-semibold text-ink mb-3">Enquire about this course</h3>
            <EnquiryForm defaultCourseId={course.id} compact />
          </div>
        </div>
      </section>
    </div>
  );
}
