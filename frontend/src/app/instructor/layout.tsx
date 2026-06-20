import Sidebar from '@/components/Sidebar';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      <Sidebar variant="instructor" />
      <main className="flex-1 md:ml-sidebar-width overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
