"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import Logo from "@/components/Logo";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: "dashboard" },
    { name: "Students", href: "/admin/students", icon: "groups" },
    { name: "Instructors", href: "/admin/instructors", icon: "co_present" },
    { name: "Courses", href: "/admin/courses", icon: "library_books" },
    { name: "Live Sessions", href: "/admin/sessions", icon: "video_camera_front" },
    { name: "Assignments", href: "/admin/assignments", icon: "assignment" },
    { name: "Quizzes", href: "/admin/quizzes", icon: "quiz" },
    { name: "Attendance", href: "/admin/attendance", icon: "how_to_reg" },
    { name: "Announcements", href: "/admin/announcements", icon: "campaign" },
    { name: "Analytics", href: "/admin/analytics", icon: "monitoring" },
  ];

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-outline-variant/30">
        <Link href="/admin" className="flex items-center">
          <Logo variant="img2" className="h-10 w-auto" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-secondary text-on-secondary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? "filled" : ""}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-outline-variant/30">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm shrink-0">
            {profile?.full_name?.charAt(0) || "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-primary-container truncate">{profile?.full_name || "Admin User"}</p>
            <p className="text-xs text-on-surface-variant truncate">{profile?.email || "admin@insightnest.com"}</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-error bg-error/10 hover:bg-error/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
