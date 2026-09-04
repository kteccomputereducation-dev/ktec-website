import { CheckCircle2 } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const PHILOSOPHY = [
  {
    title: "Practical, lab-first learning",
    body: "Every course is built around hands-on lab time rather than passive lectures, so students leave able to actually use the tools they've studied.",
  },
  {
    title: "Industry-aligned curriculum",
    body: "Course content is shaped around what employers and real projects actually need — from CAD drafting standards to accounting compliance.",
  },
  {
    title: "Student-first environment",
    body: "Small, supportive batches with individual attention for school students, college students, and working professionals alike.",
  },
  {
    title: "Career guidance, not just training",
    body: "Beyond the syllabus, students get guidance on career paths, further study options, and how a course fits their goals.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-blueprint/10 bg-white">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 py-16 md:py-20">
          <span className="font-mono text-xs tracking-widest uppercase text-signal">About K TEC</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink">
            Practical computer education, built for real careers
          </h1>
          <p className="mt-5 text-slate text-base md:text-lg leading-relaxed max-w-3xl">
            K TEC Computer Education is a computer training institute based in Neyveli, Tamil Nadu,
            offering professional computer education, technical training, software training and
            career-oriented courses for school students, college students and working professionals.
            Our training combines structured curriculum with substantial hands-on lab time, so students
            build real, usable skills — not just certificates.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="crop-marks bg-white border border-blueprint/10 p-8">
          <h2 className="font-display text-xl font-semibold text-ink">Our Vision</h2>
          <p className="mt-3 text-sm text-slate leading-relaxed">
            To be a trusted local institute that equips students and professionals in and around
            Neyveli with practical, industry-relevant computer and technical skills that translate
            directly into career opportunities.
          </p>
        </div>
        <div className="crop-marks bg-white border border-blueprint/10 p-8">
          <h2 className="font-display text-xl font-semibold text-ink">Our Mission</h2>
          <p className="mt-3 text-sm text-slate leading-relaxed">
            To deliver structured, 100% practical training across computer fundamentals, programming,
            accounting, design, CAD/engineering software and professional IT — supported by experienced
            trainers and a student-friendly learning environment.
          </p>
        </div>
      </section>

      <section className="bg-white border-y border-blueprint/10">
        <div className="mx-auto max-w-5xl px-5 lg:px-8 py-16">
          <SectionHeading eyebrow="Our Approach" title="Training philosophy" />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PHILOSOPHY.map((item) => (
              <div key={item.title} className="flex gap-3">
                <CheckCircle2 size={20} className="text-signal shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-semibold text-ink text-sm">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-slate leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 lg:px-8 py-16">
        <div className="crop-marks bg-blueprint text-white p-10 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1">
            <span className="font-mono text-xs tracking-widest uppercase text-signal">Founder / Head of Institution</span>
            <h2 className="mt-3 font-display text-3xl font-semibold">Kaviyarasan G</h2>
            <p className="font-mono text-sm text-white/60 mt-1">B.E., MBA</p>
          </div>
          <div className="md:col-span-2 text-white/80 text-sm leading-relaxed">
            As the founder and head of K TEC Computer Education, Kaviyarasan G leads the institute's
            focus on practical, career-oriented training — building a curriculum and learning
            environment centered on real skills, individual guidance and industry relevance for every
            student who joins.
          </div>
        </div>
      </section>
    </div>
  );
}
