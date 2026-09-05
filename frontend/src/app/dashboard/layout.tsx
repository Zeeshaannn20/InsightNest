import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar variant="student" />
      <main className="flex-1 md:ml-sidebar-width p-margin-mobile md:p-margin-desktop pb-20 md:pb-margin-desktop">
        {/* Sits above the page content so the bell is reachable from anywhere
            in the dashboard, not just one screen. */}
        <div className="flex justify-end mb-4">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}
