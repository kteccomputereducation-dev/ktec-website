import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Course } from "@/lib/types";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="crop-marks group block bg-white border border-blueprint/10 hover:border-signal transition-colors p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {course.category_name && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-signal">
              {course.category_name}
            </span>
          )}
          <h3 className="mt-1.5 font-display text-lg font-semibold text-ink leading-snug">
            {course.title}
          </h3>
        </div>
        <ArrowUpRight
          size={20}
          className="shrink-0 text-blueprint/30 group-hover:text-signal transition-colors"
        />
      </div>

      <p className="mt-3 text-sm text-slate leading-relaxed line-clamp-2">
        {course.short_description}
      </p>

      <div className="mt-5 pt-4 border-t border-dashed border-blueprint/15 flex items-center justify-between font-mono text-xs text-slate">
        <span>DUR&nbsp;&nbsp;{course.duration || "—"}</span>
        <span>{course.fees ? `₹${course.fees.toLocaleString("en-IN")}` : "Enquire for fees"}</span>
      </div>
    </Link>
  );
}
