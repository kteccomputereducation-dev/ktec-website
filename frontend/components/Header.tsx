"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/offers", label: "Offers" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const studentLoginHref = user?.role === "student" ? "/dashboard" : "/login";
  const studentLoginLabel = user?.role === "student" ? "Dashboard" : "Student Login";

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-blueprint/10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative flex h-10 w-10 items-center justify-center border-2 border-blueprint text-blueprint font-display font-bold text-lg">
              <span className="absolute -top-1 -left-1 h-2 w-2 border-t border-l border-signal" />
              <span className="absolute -bottom-1 -right-1 h-2 w-2 border-b border-r border-signal" />
              K
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display font-semibold text-[15px] tracking-tight text-ink">
                K TEC COMPUTER EDUCATION
              </span>
              <span className="font-mono text-[10px] tracking-wider text-slate uppercase">
                Neyveli · Est. Practical Training
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-signal ${
                  pathname === link.href ? "text-blueprint" : "text-charcoal"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={studentLoginHref}
              className="text-sm font-medium text-charcoal hover:text-signal transition-colors"
            >
              {studentLoginLabel}
            </Link>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-1 bg-draft hover:bg-draft-dark text-ink font-display font-semibold text-sm px-4 py-2.5 transition-colors"
            >
              Join Now <ChevronRight size={15} strokeWidth={2.5} />
            </Link>
          </nav>

          <button
            className="lg:hidden text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-blueprint/10 bg-paper">
          <nav className="mx-auto max-w-7xl px-5 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium border-b border-blueprint/5 text-charcoal"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={studentLoginHref}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium border-b border-blueprint/5 text-charcoal"
            >
              {studentLoginLabel}
            </Link>
            <Link
              href="/admissions"
              onClick={() => setOpen(false)}
              className="mt-4 text-center bg-draft text-ink font-display font-semibold py-3"
            >
              Join Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
