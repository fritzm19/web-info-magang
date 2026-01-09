import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import ViewCVButton from "@/components/ViewCVButton";
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  Edit3 
} from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 1. Fetch User (Gunakan email untuk keamanan jika ID string/int membingungkan)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
      redirect("/login");
  }

  // 2. Fetch Application
  const application = await prisma.application.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <>
      {/* Menggunakan Header yang sama dengan Dashboard agar konsisten */}
      <DashboardHeader 
        title="Profil Saya" 
        subtitle="Kelola informasi akun dan data pendaftaran magang Anda." 
      />

      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 bg-gray-50 min-h-full">

        {/* --- SECTION 1: KARTU IDENTITAS (AKUN) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#1193b5]/10 px-6 py-4 border-b border-[#1193b5]/20 flex items-center gap-2">
                <User size={18} className="text-[#1193b5]" />
                <h3 className="font-bold text-[#1193b5]">Informasi Akun</h3>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar Besar */}
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#1193b5] to-[#0e7a96] text-white flex items-center justify-center text-3xl font-bold shadow-md shrink-0">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>

                {/* Detail Akun */}
                <div className="flex-1 text-center md:text-left space-y-3 w-full">
                    <div>
                        <p className="text-sm text-gray-400 font-medium">Nama Lengkap</p>
                        <h2 className="text-xl font-bold text-gray-800">{session.user?.name}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <Mail size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-700 truncate">{session.user?.email}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                <Briefcase size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Role</p>
                                <p className="text-sm font-medium text-gray-700 uppercase">{session.user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- SECTION 2: DATA LAMARAN (APPLICATION) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[#1193b5]" />
                    <h3 className="font-bold text-gray-800">Data Magang</h3>
                </div>
                
                {/* Status Badge */}
                {application && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        application.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' :
                        application.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                        {application.status === 'PENDING' ? 'MENUNGGU VERIFIKASI' : application.status}
                    </span>
                )}
            </div>

            <div className="p-6">
                {!application ? (
                    // --- STATE: BELUM ADA DATA ---
                    <div className="text-center py-10 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-gray-900 font-bold text-lg">Belum Ada Data Lamaran</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                            Anda belum melengkapi formulir pendaftaran magang. Data ini diperlukan untuk proses seleksi.
                        </p>
                        <Link 
                            href="/dashboard/apply" 
                            className="bg-[#1193b5] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0e7a96] transition inline-flex items-center gap-2 shadow-lg"
                        >
                            <Edit3 size={16} /> Isi Formulir Sekarang
                        </Link>
                    </div>
                ) : (
                    // --- STATE: DATA SUDAH ADA ---
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Kampus */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1 group-hover:text-[#1193b5] transition">
                                    <GraduationCap size={16} /> Universitas / Sekolah
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-semibold text-gray-800">
                                    {application.campus}
                                </div>
                            </div>

                            {/* Jurusan */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1 group-hover:text-[#1193b5] transition">
                                    <BookOpen size={16} /> Jurusan
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-semibold text-gray-800">
                                    {application.major}
                                </div>
                            </div>

                            {/* Semester */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1 group-hover:text-[#1193b5] transition">
                                    <Calendar size={16} /> Semester Saat Ini
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-semibold text-gray-800">
                                    Semester {application.semester}
                                </div>
                            </div>

                            {/* Dokumen CV */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-1 group-hover:text-[#1193b5] transition">
                                    <FileText size={16} /> Curriculum Vitae (CV)
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                                    {application.cvUrl ? (
                                        <>
                                          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                              CV_Uploaded.pdf
                                          </span>
                                          <ViewCVButton 
                                            cvUrl={application.cvUrl} 
                                            fileName={`CV_${session.user?.name}.pdf`} 
                                          />
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Tidak ada file.</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tombol Edit (Hanya muncul jika status PENDING) */}
                        {application.status === 'PENDING' && (
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                <Link 
                                    href="/dashboard/apply" 
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1193b5] font-medium transition px-4 py-2 rounded-lg hover:bg-blue-50"
                                >
                                    <Edit3 size={16} /> Edit Data Lamaran
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>
    </>
  );
}