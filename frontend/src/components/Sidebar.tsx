"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import Logo from "@/components/Logo";

interface SidebarProps {
  variant?: "student" | "instructor";
}

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

const studentNavItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
  { icon: "auto_stories", label: "My Courses", href: "/dashboard/courses" },
  { icon: "videocam", label: "Live Classes", href: "/dashboard/live" },
  { icon: "assignment", label: "Assignments", href: "/dashboard/assignments" },
  { icon: "quiz", label: "Quizzes", href: "/dashboard/quizzes" },
  { icon: "how_to_reg", label: "Attendance", href: "/dashboard/attendance" },
  { icon: "campaign", label: "Announcements", href: "/dashboard/announcements" },
  { icon: "workspace_premium", label: "Certificates", href: "/dashboard/certificates" },
];

const instructorNavItems: NavItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/instructor" },
  { icon: "auto_stories", label: "Courses", href: "/instructor/courses" },
  { icon: "groups", label: "Students", href: "/instructor/students" },
  { icon: "videocam", label: "Live Classes", href: "/instructor/live" },
  { icon: "assignment", label: "Assignments", href: "/instructor/assignments" },
  { icon: "quiz", label: "Quizzes", href: "/instructor/quizzes" },
  { icon: "campaign", label: "Announcements", href: "/instructor/announcements" },
  { icon: "analytics", label: "Analytics", href: "/instructor/analytics" },
];

export default function Sidebar({ variant = "student" }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut, isInstructor, isAdmin } = useAuth();
  
  const navItems = variant === "instructor" ? instructorNavItems : studentNavItems;

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/instructor") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-full py-margin-desktop fixed left-0 top-0 w-sidebar-width bg-surface-container-lowest border-r border-outline-variant/30 z-50">
        {/* Logo */}
        <div className="px-8 mb-6">
          <Link href="/" className="flex items-center">
            <Logo variant="img2" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-r-xl text-label-lg transition-all duration-200 group relative ${
                  active
                    ? "bg-secondary text-on-secondary rounded-l-xl shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-secondary-container rounded-r-full" />
                )}
                <span
                  className={`material-symbols-outlined text-xl ${active ? "filled" : ""}`}
                  style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-error text-on-error text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Portals Access */}
        {variant === "student" && (isInstructor || isAdmin) && (
          <div className="px-6 mb-4 mt-2 border-t border-white/10 pt-4">
            <Link href={isAdmin ? "/admin" : "/instructor"} className="block w-full text-center bg-secondary text-on-secondary text-xs font-bold py-2.5 rounded-lg hover:bg-secondary/90 transition-colors btn-press">
              {isAdmin ? "Admin Dashboard" : "Instructor Dashboard"}
            </Link>
          </div>
        )}

        {variant === "instructor" && (
          <div className="px-6 mb-4 mt-2 border-t border-white/10 pt-4">
            <Link href="/dashboard" className="block w-full text-center border border-white/20 text-on-primary text-xs font-bold py-2.5 rounded-lg hover:bg-white/10 transition-colors btn-press">
              Student Portal
            </Link>
            {isAdmin && (
              <Link href="/admin" className="block w-full text-center bg-secondary text-on-secondary text-xs font-bold py-2.5 rounded-lg hover:bg-secondary/90 transition-colors btn-press mt-2">
                Admin Dashboard
              </Link>
            )}
          </div>
        )}

        {/* Profile Info */}
        <div className="px-6 mb-4">
          <Link href={variant === "student" ? "/dashboard/profile" : "/instructor/profile"} className="flex items-center gap-3 py-3 border-t border-outline-variant/30 hover:bg-surface-container rounded-lg transition-colors group cursor-pointer px-2 -mx-2">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden shrink-0">
              <span className="text-secondary font-semibold text-sm">
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-primary-container text-sm font-semibold truncate group-hover:text-primary transition-colors">{profile?.full_name || "User"}</p>
              <p className="text-on-surface-variant text-xs truncate capitalize">{profile?.role || "student"}</p>
            </div>
          </Link>
        </div>

        {/* Bottom links */}
        <div className="px-6 py-4 border-t border-outline-variant/30 space-y-1">
          <button onClick={signOut} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-error bg-error/10 hover:bg-error/20 transition-colors w-full">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container border-t border-outline-variant z-50">
        <div className="flex justify-around items-center h-16">
          {(variant === "student"
            ? [
                { icon: "home", label: "Home", href: "/dashboard" },
                { icon: "auto_stories", label: "Courses", href: "/dashboard/courses" },
                { icon: "videocam", label: "Live", href: "/dashboard/live" },
                { icon: "assignment", label: "Tasks", href: "/dashboard/assignments" },
                { icon: "person", label: "Account", href: "/dashboard/profile" },
              ]
            : [
                { icon: "home", label: "Home", href: "/instructor" },
                { icon: "auto_stories", label: "Courses", href: "/instructor/courses" },
                { icon: "videocam", label: "Live", href: "/instructor/live" },
                { icon: "campaign", label: "Announce", href: "/instructor/announcements" },
                { icon: "person", label: "Account", href: "/instructor/profile" },
              ]
          ).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                  active ? "text-secondary" : "text-on-surface-variant"
                }`}
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
