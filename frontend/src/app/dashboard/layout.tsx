import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar variant="student" />
      <main className="flex-1 md:ml-sidebar-width p-margin-mobile md:p-margin-desktop pb-20 md:pb-margin-desktop">
        {children}
      </main>
    </div>
  );
}
