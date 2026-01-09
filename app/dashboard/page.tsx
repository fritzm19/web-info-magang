import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Pastikan path ini sesuai dengan lokasi instance prisma Anda
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/Header";
import ViewCVButton from "@/components/ViewCVButton";
import { 
  FileText, 
  Clock, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from "lucide-react";

// Helper untuk format tanggal
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(date);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 1. Ambil User ID berdasarkan email dari session
  // (Langkah ini perlu jika session.user.id tidak tersedia secara default)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
        application: true // Include relasi application jika ada
    }
  });

  if (!user) {
      redirect("/login"); // Fallback jika user tidak ada di DB
  }

  // 2. Ambil Data Lamaran (Menggunakan findFirst untuk jaga-jaga)
  const application = await prisma.application.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  const status = application?.status || null; // "PENDING", "ACCEPTED", "REJECTED"
  // Mock data kelengkapan (bisa dibuat dinamis nanti)
  const profileCompleteness = application ? 100 : 50; 

  // --- LOGIKA WARNA STATUS ---
  let statusColor = "text-gray-600 bg-gray-100 border-gray-200";
  let statusIcon = <FileText size={24} />;
  let statusText = "Belum Mengajukan";
  let statusDesc = "Silakan lengkapi formulir pendaftaran.";

  if (status === "PENDING") {
    statusColor = "text-yellow-600 bg-yellow-50 border-yellow-100";
    statusIcon = <Clock size={24} />;
    statusText = "Menunggu Verifikasi";
    statusDesc = "Berkas sedang direview oleh admin.";
  } else if (status === "ACCEPTED") {
    statusColor = "text-green-600 bg-green-50 border-green-100";
    statusIcon = <CheckCircle size={24} />;
    statusText = "Diterima";
    statusDesc = "Selamat! Lamaran magang Anda diterima.";
  } else if (status === "REJECTED") {
    statusColor = "text-red-600 bg-red-50 border-red-100";
    statusIcon = <XCircle size={24} />;
    statusText = "Ditolak";
    statusDesc = "Mohon maaf, lamaran Anda belum memenuhi kriteria.";
  }

  return (
    <>
      <DashboardHeader 
        title="Overview" 
        subtitle="Pantau status pendaftaran magang Anda di sini." 
      />

      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 bg-gray-50 min-h-full">
        
        {/* ROW 1: STATISTIK RINGKAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* KARTU 1: STATUS REAL-TIME */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Status Saat Ini</p>
                        <h3 className={`text-2xl font-bold mt-1 ${
                            status === 'ACCEPTED' ? 'text-green-600' : 
                            status === 'REJECTED' ? 'text-red-600' : 
                            status === 'PENDING' ? 'text-yellow-600' : 'text-gray-800'
                        }`}>
                            {status || "Belum Apply"}
                        </h3>
                    </div>
                    <div className={`p-2 rounded-lg border ${statusColor}`}>
                        {statusIcon}
                    </div>
                </div>
                
                {/* Pesan Kecil di Bawah */}
                <div className={`mt-4 text-xs px-3 py-2 rounded border z-10 ${statusColor}`}>
                    {statusDesc}
                </div>
            </div>

            {/* KARTU 2: KELENGKAPAN PROFIL */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-500 text-sm font-medium">Kelengkapan Akun</p>
                        <span className="text-sm font-bold text-[#1193b5]">{profileCompleteness}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
                        <div className="bg-[#1193b5] h-2.5 rounded-full" style={{ width: `${profileCompleteness}%` }}></div>
                    </div>
                </div>
                <Link 
                    href="/dashboard/profile"
                    className="text-sm text-[#1193b5] font-semibold hover:underline flex items-center gap-1"
                >
                    {status ? "Lihat Profil" : "Lengkapi Data"} <ChevronRight size={14} />
                </Link>
            </div>
            
            {/* KARTU 3: BANTUAN */}
            <div className="bg-gradient-to-br from-[#1193b5] to-[#0e7a96] p-6 rounded-xl shadow-sm text-white flex flex-col justify-between h-full">
                <div>
                    <h3 className="font-bold text-lg mb-1">Butuh Bantuan?</h3>
                    <p className="text-blue-100 text-sm">Hubungi admin jika status tidak berubah lebih dari 3 hari kerja.</p>
                </div>
                <button className="bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-4 rounded-lg transition mt-4 w-fit backdrop-blur-sm">
                    Kontak Admin
                </button>
            </div>
        </div>

        {/* ROW 2: DETAIL & SIDEBAR KANAN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KOLOM KIRI: TIMELINE DINAMIS */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">Detail Lamaran</h3>
                    {status && (
                        <span className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            ID: #APP-{application?.id}
                        </span>
                    )}
                </div>
                
                <div className="p-8">
                    {status ? (
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-8 py-2">
                            
                            {/* Step 1: Terdaftar (Always Done) */}
                            <div className="relative">
                                <span className="absolute -left-[41px] bg-green-500 h-5 w-5 rounded-full border-4 border-white shadow-sm"></span>
                                <h4 className="text-gray-800 font-bold text-sm">Lamaran Terkirim</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {application?.createdAt ? formatDate(application.createdAt) : '-'}
                                </p>
                            </div>

                            {/* Step 2: Review Process */}
                            <div className="relative">
                                <span className={`absolute -left-[41px] h-5 w-5 rounded-full border-4 border-white shadow-sm ${
                                    status === 'PENDING' ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'
                                }`}></span>
                                <h4 className="text-gray-800 font-bold text-sm">Review Admin</h4>
                                {status === 'PENDING' ? (
                                    <>
                                        <p className="text-xs text-yellow-600 mt-0.5 font-medium">Sedang Berlangsung...</p>
                                        <div className="mt-3 bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg border border-yellow-100">
                                            CV Anda sedang diperiksa oleh Kepala Sub Bagian Kepegawaian.
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-green-600 mt-0.5 font-medium">Selesai</p>
                                )}
                            </div>

                            {/* Step 3: Keputusan Akhir */}
                            <div className="relative">
                                <span className={`absolute -left-[41px] h-5 w-5 rounded-full border-4 border-white shadow-sm ${
                                    status === 'ACCEPTED' ? 'bg-green-500' : 
                                    status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-200'
                                }`}></span>
                                
                                <h4 className={`${status === 'PENDING' ? 'text-gray-400' : 'text-gray-800'} font-bold text-sm`}>
                                    Keputusan Akhir
                                </h4>
                                
                                {status === 'ACCEPTED' && (
                                    <div className="mt-2 bg-green-50 text-green-800 text-sm p-3 rounded-lg border border-green-100 flex items-center gap-2">
                                        <CheckCircle size={18} />
                                        Selamat! Anda diterima magang. Silakan cek email untuk instruksi selanjutnya.
                                    </div>
                                )}
                                
                                {status === 'REJECTED' && (
                                    <div className="mt-2 bg-red-50 text-red-800 text-sm p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                        <XCircle size={18} />
                                        Mohon maaf, pengajuan magang Anda belum dapat kami terima saat ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // TAMPILAN JIKA BELUM APPLY
                        <div className="text-center py-6">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Anda belum mengajukan magang</h3>
                            <Link 
                                href="/dashboard/apply"
                                className="inline-block mt-4 bg-[#1193b5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#0e7a96] transition"
                            >
                                Isi Formulir Sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* KOLOM KANAN: DOKUMEN */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-[#1193b5]" /> Dokumen Saya
                    </h3>
                    
                    {application?.cvUrl ? (
                         <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-red-100 p-2 rounded text-red-600">
                                        <FileText size={16} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                            CV_{session.user?.name?.replace(/\s+/g, '_')}.pdf
                                        </p>
                                        <p className="text-xs text-gray-400">Tersimpan</p>
                                    </div>
                                </div>
                                {/* Ganti dengan tombol preview */}
                                <div className="flex justify-end">
                                    <ViewCVButton 
                                        cvUrl={application.cvUrl} 
                                        fileName={`CV_${session.user?.name?.replace(/\s+/g, '_')}.pdf`} 
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Belum ada dokumen diupload.</p>
                    )}

                    <Link 
                        href="/dashboard/profile"
                        className="block w-full text-center mt-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#1193b5] hover:text-[#1193b5] transition"
                    >
                        {application ? "Update Dokumen" : "+ Upload Dokumen"}
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}