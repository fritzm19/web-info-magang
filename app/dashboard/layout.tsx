import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const application = await prisma.application.findUnique({
    where: { userId: Number(session.user.id) },
  });

  const showSidebar = !!application; 

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Kiri */}
      {showSidebar && <Sidebar session={session} />}

      {/* Konten Kanan */}
      <div className="flex-1 flex flex-col min-w-0">
        {showSidebar && <DashboardNavbar />}

        <main className={`flex-1 p-6 md:p-8 ${!showSidebar ? 'flex justify-center' : ''}`}>
           <div className={`w-full ${!showSidebar ? 'max-w-4xl mt-6' : ''}`}>
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}