"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Course, CourseCategory } from "@/lib/types";
import CourseCard from "@/components/CourseCard";
import SectionHeading from "@/components/SectionHeading";

function CoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get("category") || "all");

  useEffect(() => {
    Promise.all([
      api.get<{ courses: Course[] }>("/api/courses"),
      api.get<{ categories: CourseCategory[] }>("/api/courses/categories"),
    ])
      .then(([c, cat]) => {
        setCourses(c.courses);
        setCategories(cat.categories);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return courses;
    return courses.filter((c) => c.category_slug === activeCategory);
  }, [courses, activeCategory]);

  return (
    <div>
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
          <SectionHeading
            eyebrow="Course Catalogue"
            title="Courses at K TEC Computer Education"
            description="Practical, career-oriented courses across computer fundamentals, programming, accounting, design, CAD/engineering software and professional IT."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 text-sm font-medium border transition-colors ${
              activeCategory === "all"
                ? "bg-blueprint text-white border-blueprint"
                : "border-blueprint/20 text-charcoal hover:border-blueprint"
            }`}
          >
            All Courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${
                activeCategory === cat.slug
                  ? "bg-blueprint text-white border-blueprint"
                  : "border-blueprint/20 text-charcoal hover:border-blueprint"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-slate">Loading courses…</p>
        ) : filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-slate">No courses found in this category yet.</p>
        )}
      </section>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-16 text-sm text-slate">Loading…</div>}>
      <CoursesContent />
    </Suspense>
  );
}
