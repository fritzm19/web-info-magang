import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/dashboard/ApplicationForm";
import ViewPdfButton from "@/components/ViewPdfButton"; 
import { Clock, FileText, HelpCircle, AlertCircle } from "lucide-react";

// Metadata Server Side
export const metadata = {
  title: "Dashboard Peserta",
};

// Helper format tanggal (Indonesia)
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  }).format(date);
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 1. Validasi Session
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 2. Cegah Admin Mengakses Laman Pendaftaran Peserta
  // Jika role-nya ADMIN, lempar ke kawasan admin
  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  // 3. Fetch User & Application Data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { application: true },
  });

  if (!user) return <div>User data not found.</div>;
  
  const app = user.application;

  // 4. Siapkan Data User untuk Form (Sanitize null values)
  const userDataForForm = {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone,   // biarkan null jika null, handle di component
      agency: user.agency, // biarkan null jika null
  };

  // --- KONDISI 1: User BELUM Mendaftar (Tampilkan Form) ---
  if (!app) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Formulir Pendaftaran Magang</h1>
            <p className="text-gray-500 mt-2">Lengkapi biodata dan berkas di bawah ini untuk memulai proses seleksi.</p>
         </div>
         {/* Render Component Form */}
        <ApplicationForm user={userDataForForm} />
      </div>
    );
  }

  // --- KONDISI 2: User SUDAH Mendaftar (Tampilkan Status & Timeline) ---
  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      
      {/* ROW 1: STATUS CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                  <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Status Saat Ini</span>
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                      <Clock size={20} />
                  </div>
              </div>
              <div>
                  <h2 className={`text-3xl font-bold mb-3 ${
                        app.status === 'ACCEPTED' ? 'text-green-600' : 
                        app.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-500'
                  }`}>
                      {app.status === 'PENDING' ? 'MENUNGGU' : app.status}
                  </h2>
                  <div className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 leading-relaxed ${
                        app.status === 'ACCEPTED' ? 'bg-green-50 border-green-100 text-green-700' : 
                        app.status === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-700' : 
                        'bg-yellow-50 border-yellow-100 text-yellow-700'
                  }`}>
                      {app.status === 'PENDING' ? 'Berkas Anda sedang diverifikasi oleh admin.' : 
                        app.status === 'ACCEPTED' ? 'Selamat! Anda diterima magang.' : 'Mohon maaf, lamaran Anda belum diterima.'}
                  </div>
              </div>
          </div>

          {/* Card 2: Kelengkapan Akun (Dummy Data UI) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
              <div>
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Progress</span>
                      <span className="text-[#1193b5] font-bold text-sm">100%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                      <div className="bg-[#1193b5] h-2.5 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <p className="text-sm text-gray-600">Data administrasi Anda sudah lengkap.</p>
              </div>
          </div>

          {/* Card 3: Bantuan */}
          <div className="bg-[#1193b5] p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between h-full relative overflow-hidden group">
              <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-1">Butuh Bantuan?</h3>
                  <p className="text-blue-100 text-sm mb-4">Hubungi admin jika ada kesalahan data.</p>
                  <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded-lg transition backdrop-blur-sm">
                      Kontak Admin
                  </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-white/10 transition-transform group-hover:scale-110 duration-500">
                  <HelpCircle size={100} />
              </div>
          </div>
      </div>

      {/* ROW 2: TIMELINE & DOCUMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TIMELINE SECTION */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-800">Riwayat Lamaran</h3>
              <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">
                #{app.id.toString().padStart(4, '0')}
              </span>
            </div>

            <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:h-[90%] before:w-0.5 before:bg-gray-100">
              
              {/* Timeline Item 1 */}
              <div className="relative pl-12">
                <span className="absolute left-4 -translate-x-1/2 top-1 w-5 h-5 bg-green-500 rounded-full ring-4 ring-white z-10"></span>
                <h4 className="font-bold text-gray-900 text-sm">Pendaftaran Berhasil</h4>
                <p className="text-xs text-gray-400 mt-1">{formatDate(app.createdAt)}</p>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative pl-12">
                <span className={`absolute left-4 -translate-x-1/2 top-1 w-5 h-5 rounded-full ring-4 ring-white z-10 ${
                  app.status !== 'PENDING' ? 'bg-green-500' : 'bg-yellow-400'
                }`}></span>
                <h4 className="font-bold text-gray-900 text-sm">
                  {app.status === 'PENDING' ? 'Menunggu Review' : 'Review Selesai'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                   {app.status === 'PENDING' ? 'Berkas anda sedang di-review oleh Kepala Sub Bagian Kepegawaian' : 'Berkas telah diperiksa.'}
                </p>
              </div>

              {/* Timeline Item 3 */}
              <div className="relative pl-12">
                <span className={`absolute left-4 -translate-x-1/2 top-1 w-5 h-5 rounded-full ring-4 ring-white z-10 ${
                  app.status === 'ACCEPTED' ? 'bg-green-500' : 
                  app.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-200'
                }`}></span>
                <h4 className="font-bold text-gray-900 text-sm">Keputusan Akhir</h4>
                <p className="text-xs text-gray-400 mt-1">
                  {app.status === 'ACCEPTED' ? 'Diterima' : app.status === 'REJECTED' ? 'Ditolak' : 'Menunggu...'}
                </p>
              </div>
            </div>
          </div>

          {/* DOCUMENTS SECTION */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-[#1193b5]" /> Dokumen Terkirim
              </h3>
              
              <div className="space-y-4">
                  {app.cvUrl && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-bold">PDF</span>
                              </div>
                              <div className="truncate">
                                  <p className="text-xs font-bold text-gray-700 truncate">CV_Saya.pdf</p>
                              </div>
                          </div>
                          <ViewPdfButton url={app.cvUrl} label="Buka" fileName={`CV - ${app.fullName}.pdf`} />
                      </div>
                  )}

                  {app.proposalUrl && (
                       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center shrink-0">
                                  <span className="text-[9px] font-bold">PDF</span>
                              </div>
                              <div className="truncate">
                                  <p className="text-xs font-bold text-gray-700 truncate">Srt_Pengantar.pdf</p>
                              </div>
                          </div>
                          <ViewPdfButton url={app.proposalUrl} label="Buka" fileName={`Surat Pengantar - ${app.fullName}.pdf`} />
                      </div>
                  )}
              </div>
          </div>
      </div>

    </div>
  );
}