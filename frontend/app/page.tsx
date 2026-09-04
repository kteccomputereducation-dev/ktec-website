import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Laptop2,
  Briefcase,
  Award,
  GraduationCap,
  Wrench,
  Target,
  ArrowRight,
} from "lucide-react";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import CourseCard from "@/components/CourseCard";
import { api } from "@/lib/api";
import { Course, Testimonial } from "@/lib/types";

const STRENGTHS = [
  { icon: ShieldCheck, label: "ISO Certified Institute" },
  { icon: Users, label: "Experienced Trainers" },
  { icon: Laptop2, label: "100% Practical Lab Training" },
  { icon: Briefcase, label: "Placement Assistance" },
  { icon: Award, label: "Certificate After Completion" },
  { icon: GraduationCap, label: "School & College Training" },
  { icon: Wrench, label: "Industry-Oriented Courses" },
  { icon: Target, label: "Career Guidance" },
];

async function getCourses(): Promise<Course[]> {
  try {
    const data = await api.get<{ courses: Course[] }>("/api/courses");
    return data.courses.slice(0, 6);
  } catch {
    return [];
  }
}

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await api.get<{ testimonials: Testimonial[] }>("/api/testimonials");
    return data.testimonials.slice(0, 3);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [courses, testimonials] = await Promise.all([getCourses(), getTestimonials()]);

  return (
    <>
      <Hero />

      {/* Strengths strip */}
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-14">
          <SectionHeading eyebrow="Why K TEC" title="Training built around practical outcomes" />
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STRENGTHS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col gap-3">
                <span className="flex h-11 w-11 items-center justify-center border border-blueprint/20 text-blueprint">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <span className="text-sm font-medium text-charcoal leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Course Catalogue"
            title="Popular courses"
            description="From computer fundamentals to CAD and enterprise software — practical training mapped to real careers."
          />
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-blueprint hover:text-signal">
            View all courses <ArrowRight size={15} />
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-slate">
            Courses will appear here once added from the Admin Panel, or once the backend API is running.
          </p>
        )}
      </section>

      {/* Founder */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <div className="md:col-span-1">
            <span className="font-mono text-xs tracking-widest uppercase text-signal">Leadership</span>
            <h2 className="mt-3 font-display text-3xl font-semibold">Kaviyarasan G</h2>
            <p className="font-mono text-sm text-white/60 mt-1">B.E., MBA</p>
            <p className="mt-2 text-sm text-white/70">Founder / Head of Institution</p>
          </div>
          <div className="md:col-span-2 text-white/75 leading-relaxed">
            <p>
              K TEC Computer Education was founded to bring structured, practical, career-oriented
              technology training to students and professionals in Neyveli — combining hands-on lab
              work with industry-relevant curriculum across programming, design, CAD/engineering
              software, accounting and professional IT tracks.
            </p>
            <Link href="/about" className="mt-5 inline-flex items-center gap-1 text-signal font-semibold text-sm">
              Read more about our approach <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
          <SectionHeading eyebrow="Student Voices" title="What our students say" align="center" />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="crop-marks bg-white border border-blueprint/10 p-6">
                <p className="text-sm text-charcoal leading-relaxed">&ldquo;{t.review}&rdquo;</p>
                <div className="mt-5 pt-4 border-t border-dashed border-blueprint/15">
                  <p className="font-display font-semibold text-sm text-ink">{t.student_name}</p>
                  {t.course_title && (
                    <p className="font-mono text-xs text-slate mt-0.5">{t.course_title}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 pb-20">
        <div className="crop-marks bg-blueprint text-white p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold">Ready to start your training?</h2>
            <p className="mt-2 text-white/75 text-sm max-w-md">
              Talk to our team about the right course and batch for your goals.
            </p>
          </div>
          <Link
            href="/admissions"
            className="shrink-0 inline-flex items-center gap-2 bg-draft hover:bg-draft-dark text-ink font-display font-semibold px-7 py-3.5 transition-colors"
          >
            Enquire Now <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
