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

  // Cek apakah user sudah punya aplikasi
  const hasApplied = !!application; 

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar Kiri (Hanya muncul jika sudah apply) */}
      {hasApplied && <Sidebar session={session} />}

      {/* Area Kanan */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        
        {/* UPDATE: Kirim props hasApplied ke Navbar */}
        <DashboardNavbar hasApplied={hasApplied} />

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto p-6 md:p-8 ${!hasApplied ? 'flex justify-center bg-gray-50' : ''}`}>
           <div className={`w-full ${!hasApplied ? 'max-w-4xl mt-6' : ''}`}>
              {children}
           </div>
        </main>
        
      </div>
    </div>
  );
}