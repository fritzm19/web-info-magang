import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ViewPdfButton from "@/components/ViewPdfButton"; 
import { 
  User, Mail, GraduationCap, BookOpen, Calendar, 
  FileText, Building2, School, Clock, AlertCircle 
} from "lucide-react";

// Helper format tanggal
const formatDate = (date: Date | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(date);
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  const app = await prisma.application.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
        <p className="text-sm text-gray-500 mt-1">
            Kelola informasi akun dan data pendaftaran magang Anda.
        </p>
      </div>

      {/* --- 1. KARTU AKUN (Role Dihilangkan) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/30 flex items-center gap-2">
              <User size={18} className="text-[#1193b5]" />
              <h3 className="font-bold text-[#1193b5] text-sm uppercase tracking-wide">Informasi Akun</h3>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#1193b5] to-[#0e7a96] text-white flex items-center justify-center text-2xl font-bold shadow-lg shrink-0 border-4 border-white">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Nama Lengkap</p>
                          <h2 className="text-lg font-bold text-gray-800">{session.user?.name}</h2>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                              <Mail size={16} />
                          </div>
                          <div className="overflow-hidden">
                              <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                              <p className="text-sm font-medium text-gray-700 truncate">{session.user?.email}</p>
                          </div>
                      </div>
                  </div>
                  
                  {/* TOMBOL REQUEST UPDATE */}
                  <div className="pt-2">
                      <button className="text-xs font-bold text-gray-500 hover:text-[#1193b5] flex items-center gap-2 transition border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-blue-200">
                          <AlertCircle size={14} />
                          Ajukan Perubahan Data Diri
                      </button>
                      <p className="text-[10px] text-gray-400 mt-1 ml-1">*Perubahan data memerlukan persetujuan admin.</p>
                  </div>
              </div>
          </div>
      </div>

      {/* --- 2. DATA MAGANG LENGKAP --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#1193b5]" />
                  <h3 className="font-bold text-[#1193b5] text-sm uppercase tracking-wide">Data Magang</h3>
              </div>
          </div>

          <div className="p-6">
              {!app ? (
                  <div className="text-center py-8">
                      <p className="text-gray-500 text-sm mb-4">Anda belum melengkapi data magang.</p>
                  </div>
              ) : (
                  <div className="space-y-6">
                      
                      {/* Grid Data Akademik */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                          <div>
                              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                                  <Building2 size={14} /> Asal Instansi
                              </label>
                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800">
                                  {app.campus}
                              </div>
                          </div>

                          <div>
                              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                                  <School size={14} /> Fakultas
                              </label>
                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800">
                                  {app.faculty || "-"}
                              </div>
                          </div>

                          <div>
                              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                                  <BookOpen size={14} /> Jurusan
                              </label>
                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800">
                                  {app.major}
                              </div>
                          </div>

                          <div>
                              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                                  <GraduationCap size={14} /> Semester
                              </label>
                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800">
                                  Semester {app.semester}
                              </div>
                          </div>
                      </div>

                      <hr className="border-gray-100" />

                      {/* Periode Magang */}
                      <div>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-3">
                              <Clock size={14} /> Periode Magang
                          </label>
                          <div className="flex flex-col md:flex-row gap-4">
                              <div className="flex-1 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                  <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Tanggal Mulai</p>
                                  <p className="text-sm font-bold text-gray-800">{formatDate(app.startDate)}</p>
                              </div>
                              <div className="flex-1 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                  <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Tanggal Selesai</p>
                                  <p className="text-sm font-bold text-gray-800">{formatDate(app.endDate)}</p>
                              </div>
                          </div>
                      </div>

                      <hr className="border-gray-100" />

                      {/* Dokumen */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                                  <FileText size={14} /> Curriculum Vitae (CV)
                              </label>
                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-600 truncate max-w-[150px]">
                                      {app.cvUrl ? "CV_Terbaru.pdf" : "-"}
                                  </span>
                                  {app.cvUrl && (
                                      <ViewPdfButton 
                                        url={app.cvUrl} 
                                        label="Lihat"
                                        fileName={`CV_${session.user?.name}.pdf`} 
                                      />
                                  )}
                              </div>
                          </div>

                          <div>
                              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-2">
                                  <FileText size={14} /> Surat Pengantar
                              </label>
                              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-600 truncate max-w-[150px]">
                                      {app.proposalUrl ? "Surat_Pengantar.pdf" : "-"}
                                  </span>
                                  {app.proposalUrl && (
                                      <ViewPdfButton 
                                        url={app.proposalUrl} 
                                        label="Lihat"
                                        fileName={`Surat_Pengantar_${session.user?.name}.pdf`} 
                                      />
                                  )}
                              </div>
                          </div>
                      </div>

                  </div>
              )}
          </div>
      </div>

    </div>
  );
}