import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/dashboard/ApplicationForm";
import ViewPdfButton from "@/components/ViewPdfButton"; 
import { Clock, FileText, HelpCircle, AlertCircle } from "lucide-react";

// Helper format tanggal
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  }).format(date);
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Perbaikan 1: Pastikan email ada sebelum lanjut query DB
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { 
        // Perbaikan 1: Hapus tanda seru (!) dan tanda tanya (?) karena sudah divalidasi if di atas
        email: session.user.email 
    },
    include: { application: true },
  });

  if (!user) return <div>User not found</div>;
  
  const app = user.application;

  // Perbaikan 2: Normalisasi data user agar 'name' tidak pernah null
  // Kita buat object baru yang 'aman' untuk dikirim ke Component
  const sanitizedUser = {
      ...user,
      name: user.name || "", // Jika null, ganti jadi string kosong
  };

  return (
    <>
        {!app ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900">Lengkapi Berkas Magang</h1>
                <p className="text-gray-500">Isi formulir berikut untuk mengajukan permohonan magang.</p>
             </div>
            {/* Perbaikan 2: Kirim sanitizedUser, bukan user mentah */}
            <ApplicationForm user={sanitizedUser} />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* ROW 1: STATUS CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Status */}
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
                            {app.status === 'PENDING' ? 'PENDING' : app.status}
                        </h2>
                        <div className={`text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${
                             app.status === 'ACCEPTED' ? 'bg-green-50 border-green-100 text-green-700' : 
                             app.status === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-700' : 
                             'bg-yellow-50 border-yellow-100 text-yellow-700'
                        }`}>
                            {app.status === 'PENDING' ? 'Menunggu verifikasi admin.' : 
                             app.status === 'ACCEPTED' ? 'Selamat! Pengajuan magang anda diterima.' : 'Mohon maaf, pengajuan magang anda belum dapat kami terima.'}
                        </div>
                    </div>
                </div>

                {/* 2. Kelengkapan Akun */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 font-medium text-xs uppercase tracking-wider">Kelengkapan Akun</span>
                            <span className="text-[#1193b5] font-bold text-sm">80%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                            <div className="bg-[#1193b5] h-2.5 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                    </div>
                    <button className="text-[#1193b5] text-sm font-bold hover:underline text-left flex items-center gap-1">
                        Lengkapi Data &gt;
                    </button>
                </div>

                {/* 3. Bantuan */}
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
                
                {/* TIMELINE */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-gray-800">Detail Lamaran</h3>
                    <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">
                      ID: #APP-{app.id}
                    </span>
                  </div>

                  <div className="relative space-y-8 before:absolute before:left-4 before:top-2 before:h-[90%] before:w-0.5 before:bg-gray-100">
                    
                    {/* Step 1: Akun Terdaftar */}
                    <div className="relative pl-12">
                      <span className="absolute left-4 -translate-x-1/2 top-1 w-5 h-5 bg-green-500 rounded-full ring-4 ring-white flex items-center justify-center z-10">
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm">Akun Terdaftar</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(app.createdAt)}
                      </p>
                    </div>

                    {/* Step 2: Review Admin */}
                    <div className="relative pl-12">
                      <span className={`absolute left-4 -translate-x-1/2 top-1 w-5 h-5 rounded-full ring-4 ring-white flex items-center justify-center z-10 ${
                        app.status !== 'PENDING' ? 'bg-green-500' : 'bg-yellow-400'
                      }`}></span>
                      
                      <h4 className={`font-bold text-sm ${app.status !== 'PENDING' ? 'text-gray-900' : 'text-gray-900'}`}>
                        {app.status === 'PENDING' ? 'Menunggu Review Admin' : 'Verifikasi Berkas Selesai'}
                      </h4>
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {app.status === 'PENDING' ? 'Sedang diproses...' : 'Telah divalidasi oleh admin.'}
                      </p>
                      
                      {app.status === 'PENDING' && (
                        <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-xs text-yellow-800 flex gap-3 items-start leading-relaxed animate-in fade-in zoom-in duration-300">
                          <AlertCircle size={16} className="mt-0.5 shrink-0 text-yellow-600" />
                          <p>CV Anda sedang diperiksa oleh Kepala Sub Bagian Kepegawaian.</p>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Keputusan Akhir */}
                    <div className="relative pl-12">
                      <span className={`absolute left-4 -translate-x-1/2 top-1 w-5 h-5 rounded-full ring-4 ring-white flex items-center justify-center z-10 ${
                        app.status === 'ACCEPTED' ? 'bg-green-500' : 
                        app.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-200'
                      }`}></span>
                      <h4 className={`font-bold text-sm ${
                        app.status === 'ACCEPTED' || app.status === 'REJECTED' ? 'text-gray-900' : 'text-gray-400'
                      }`}>Keputusan Akhir</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {app.status === 'ACCEPTED' ? 'Diterima' : app.status === 'REJECTED' ? 'Ditolak' : 'Belum ditentukan'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DOKUMEN SAYA */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FileText size={18} className="text-[#1193b5]" /> Dokumen Saya
                    </h3>
                    
                    <div className="space-y-4">
                        {/* CV BUTTON */}
                        {app.cvUrl && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold">PDF</span>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-bold text-gray-700 truncate">CV_Terbaru.pdf</p>
                                        <p className="text-[10px] text-gray-400">Preview</p>
                                    </div>
                                </div>
                                <ViewPdfButton 
                                    url={app.cvUrl} 
                                    label="Lihat" 
                                    fileName={`CV - ${app.fullName}.pdf`} 
                                />
                            </div>
                        )}

                        {/* PROPOSAL / SURAT PENGANTAR BUTTON */}
                        {app.proposalUrl && (
                             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-bold">PDF</span>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-bold text-gray-700 truncate">Surat_Pengantar.pdf</p>
                                        <p className="text-[10px] text-gray-400">Preview</p>
                                    </div>
                                </div>
                                <ViewPdfButton 
                                    url={app.proposalUrl} 
                                    label="Lihat" 
                                    fileName={`Surat Pengantar - ${app.fullName}.pdf`} 
                                />
                            </div>
                        )}
                    </div>

                    <button className="w-full mt-6 py-3 border border-dashed border-gray-300 text-gray-400 text-xs font-bold rounded-xl hover:bg-gray-50 hover:text-gray-600 hover:border-gray-400 transition">
                        + Update Dokumen
                    </button>
                </div>
            </div>

          </div>
        )}
    </>
  );
}