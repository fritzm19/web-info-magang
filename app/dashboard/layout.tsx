import { getServerSession } from "next-auth";
// Pastikan path authOptions sesuai konfigurasi Anda
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import LogoutButton from "@/components/LogoutButton"; // Untuk mobile view

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Persistent */}
      <Sidebar session={session} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header (Hanya muncul di HP) */}
        <div className="md:hidden bg-[#1193b5] text-white p-4 flex justify-between items-center shadow-md shrink-0">
          <h1 className="font-bold">Portal Magang</h1>
          <LogoutButton />
        </div>

        {/* Dynamic Children (Halaman yang berubah-ubah) */}
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
      </main>
    </div>
  );
}