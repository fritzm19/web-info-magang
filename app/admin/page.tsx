// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ApplicationTable from "./ApplicationTable";
import DashboardHeader from "@/components/dashboard/Header"; // Kita reuse Header dashboard yg sudah bagus
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Fetch Data (Sort dari yang terbaru)
  const applications = await prisma.application.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  // Hitung Statistik Sederhana
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <>
      <DashboardHeader 
        title="Dashboard Admin" 
        subtitle="Overview pendaftaran magang dan manajemen status." 
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* --- SECTION 1: STATISTIK CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card: Total Pendaftar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Total Masuk</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Users size={24} />
                </div>
            </div>

            {/* Card: Menunggu Review */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Perlu Review</p>
                    <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</h3>
                </div>
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                    <Clock size={24} />
                </div>
            </div>

            {/* Card: Diterima */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Diterima</p>
                    <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</h3>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                    <CheckCircle size={24} />
                </div>
            </div>

            {/* Card: Ditolak */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Ditolak</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</h3>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <XCircle size={24} />
                </div>
            </div>
        </div>

        {/* --- SECTION 2: TABEL APLIKASI --- */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users size={20} className="text-[#1193b5]"/>
                Daftar Pemohon Terbaru
            </h3>
            
            {/* Tabel yang sudah Anda buat sebelumnya */}
            <ApplicationTable initialData={applications} />
        </div>

      </div>
    </>
  );
}