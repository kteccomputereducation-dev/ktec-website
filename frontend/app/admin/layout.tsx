"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Inbox,
  Layers,
  Award,
  Tag,
  Image as ImageIcon,
  MessageSquareQuote,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/batches", label: "Batches", icon: Layers },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage || loading) return;
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      router.replace("/admin/login");
    }
  }, [loading, user, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-blueprint" size={28} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-24 lg:self-start">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active ? "bg-blueprint text-white" : "text-charcoal hover:bg-white"
              }`}
            >
              <Icon size={16} /> {label}
            </Link>
          );
        })}
        <button
          onClick={async () => {
            await logout();
            router.push("/admin/login");
          }}
          className="mt-3 flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate hover:text-red-600"
        >
          <LogOut size={16} /> Log out
        </button>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
