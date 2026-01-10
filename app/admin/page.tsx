import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation"; 
import { prisma } from "@/lib/prisma";
import ApplicationTable from "./ApplicationTable";
import DashboardHeader from "@/components/dashboard/Header";
import { Users, Clock, CheckCircle, XCircle, LucideIcon } from "lucide-react"; // 1. Import LucideIcon

export const metadata = {
  title: "Admin Panel",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch Data Lengkap
  const applications = await prisma.application.findMany({
    include: { 
      user: { select: { email: true, name: true } } 
    },
    orderBy: { createdAt: 'desc' }
  });

  // Statistik
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <>
      <DashboardHeader 
        title="Admin Control Panel" 
        subtitle="Overview pendaftaran magang, validasi berkas, dan penerbitan surat." 
      />

      <div className="p-6 md:p-8 max-w-400 mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* --- STATISTIK CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Masuk" value={stats.total} icon={Users} color="blue" />
            <StatCard label="Perlu Review" value={stats.pending} icon={Clock} color="yellow" />
            <StatCard label="Diterima" value={stats.accepted} icon={CheckCircle} color="green" />
            <StatCard label="Ditolak" value={stats.rejected} icon={XCircle} color="red" />
        </div>

        {/* --- TABEL APLIKASI --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Daftar Pemohon</h3>
                    <p className="text-xs text-gray-500">Manage status penerimaan dan dokumen.</p>
                </div>
            </div>
            <ApplicationTable initialData={applications} />
        </div>

      </div>
    </>
  );
}

// 2. Definisikan Interface Props
interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon; // Tipe khusus untuk icon Lucide
  color: "blue" | "yellow" | "green" | "red"; // Batasi string warna yang diizinkan
}

// 3. Gunakan Interface StatCardProps menggantikan 'any'
function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        yellow: "bg-yellow-50 text-yellow-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
    };
    
    // Type checking otomatis aman karena kita pakai union type di interface
    const colorClass = colors[color] || colors.blue;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${colorClass}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}