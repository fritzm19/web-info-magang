import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 1. Fixed Desktop Sidebar (Left) */}
      <Sidebar session={session} />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar (Sticky) */}
        <TopNav user={session?.user} />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}