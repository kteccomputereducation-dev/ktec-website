import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-blueprint/10">
      <div className="absolute inset-0 blueprint-grid" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/95 to-paper" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 py-20 md:py-28">
        <div className="crop-marks max-w-3xl border border-blueprint/15 bg-white/70 backdrop-blur-sm p-8 md:p-12">
          <span className="font-mono text-xs tracking-widest uppercase text-signal">
            K TEC Computer Education · Neyveli
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight text-ink leading-[1.05]">
            Build Your Skills.
            <br />
            Shape Your Career.
          </h1>
          <p className="mt-5 text-base md:text-lg text-slate max-w-xl leading-relaxed">
            Professional Computer Education &amp; Career-Oriented Training in Neyveli — practical,
            industry-oriented courses from computer fundamentals to CAD, programming and SAP.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-blueprint hover:bg-blueprint-dark text-white font-display font-semibold px-6 py-3.5 transition-colors"
            >
              Explore Courses <ArrowRight size={17} />
            </Link>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 bg-draft hover:bg-draft-dark text-ink font-display font-semibold px-6 py-3.5 transition-colors"
            >
              Join Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-blueprint/30 hover:border-blueprint text-blueprint font-display font-semibold px-6 py-3.5 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-blueprint/10 max-w-3xl border border-blueprint/10">
          {[
            ["100%", "Practical Training"],
            ["ISO", "Certified Institute"],
            ["12+", "Career-Oriented Courses"],
            ["1:1", "Career Guidance"],
          ].map(([stat, label]) => (
            <div key={label} className="bg-paper p-5">
              <dt className="font-mono text-2xl font-semibold text-blueprint">{stat}</dt>
              <dd className="mt-1 text-xs text-slate">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
