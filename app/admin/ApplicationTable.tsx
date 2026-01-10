// app/admin/ApplicationTable.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import ViewPdfButton from "@/components/ViewPdfButton";
import LetterModal from "@/components/admin/LetterModal"; 
import { 
    Check, X, Calendar, Building2, UserCircle 
} from "lucide-react";

// PERBAIKAN 1: Sesuaikan nama field dengan Database Prisma (startDate/endDate)
// PERBAIKAN 2: Izinkan nilai null (Date | null)
type Application = {
  id: number;
  fullName: string;
  campus: string;
  major: string;
  semester: string;
  startDate: Date | null; // Diganti dari startPeriod
  endDate: Date | null;   // Diganti dari endPeriod
  cvUrl: string | null;
  proposalUrl: string | null;
  status: string;
  user: { email: string; name: string | null };
};

export default function ApplicationTable({ initialData }: { initialData: Application[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<number | null>(null);

  const updateStatus = async (id: number, status: string) => {
    setIsLoading(id);
    try {
      await fetch("/api/application/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, newStatus: status }),
      });
      router.refresh();
    } catch (error) {
      alert("Gagal mengupdate status");
    } finally { 
      setIsLoading(null);
    }
  };

  // Helper aman untuk format tanggal (cegah error jika null)
  const formatDateSafe = (date: Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "d MMM yyyy", { locale: idLocale });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kandidat</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Durasi & Kampus</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Dokumen</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {initialData.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Belum ada data aplikasi.</td></tr>
          ) : (
            initialData.map((app) => (
              <tr key={app.id} className="group hover:bg-gray-50/80 transition-colors duration-200">
                
                {/* 1. KANDIDAT */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                        <UserCircle size={24}/>
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-sm">{app.fullName}</div>
                        <div className="text-xs text-gray-500">{app.user.email}</div>
                    </div>
                  </div>
                </td>

                {/* 2. DURASI & KAMPUS */}
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 w-fit px-2 py-1 rounded">
                            <Calendar size={12} className="text-blue-500"/>
                            {/* Gunakan formatDateSafe dan field baru */}
                            <span className="font-mono">
                                {formatDateSafe(app.startDate)} - {formatDateSafe(app.endDate)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Building2 size={12} />
                            <span className="truncate max-w-[150px]" title={app.campus}>{app.campus}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 ml-5">{app.major}</div>
                   </div>
                </td>

                {/* 3. DOKUMEN */}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {app.cvUrl ? (
                         <div className="relative group/tooltip">
                            {/* Variant Icon dipanggil disini */}
                            <ViewPdfButton 
                                url={app.cvUrl} 
                                label="CV" 
                                fileName={`CV_${app.fullName}.pdf`} 
                                variant="icon" 
                            />
                        </div>
                    ) : (
                        <span className="text-gray-300">-</span>
                    )}

                    {app.proposalUrl && (
                        <div className="relative group/tooltip">
                            <ViewPdfButton 
                                url={app.proposalUrl} 
                                label="Srt" 
                                fileName={`Pengantar_${app.fullName}.pdf`}
                                variant="icon-secondary" 
                            />
                        </div>
                    )}
                  </div>
                </td>

                {/* 4. STATUS */}
                <td className="px-6 py-4 text-center">
                   <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize
                    ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 border border-green-200' : 
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                        {app.status === 'ACCEPTED' && <Check size={10} className="mr-1 stroke-[3]"/>}
                        {app.status.toLowerCase()}
                   </span>
                </td>

                {/* 5. AKSI */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    {isLoading === app.id ? (
                      <span className="text-xs text-gray-400 animate-pulse">Saving...</span>
                    ) : (
                      <>
                        {app.status === 'PENDING' && (
                            <>
                                <button 
                                    onClick={() => updateStatus(app.id, "ACCEPTED")}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-green-200 transition"
                                    title="Terima"
                                >
                                    <Check size={16} />
                                </button>
                                <button 
                                    onClick={() => updateStatus(app.id, "REJECTED")}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-red-200 transition"
                                    title="Tolak"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        )}

                        {app.status === 'ACCEPTED' && (
                            <LetterModal application={app} />
                        )}
                      </>
                    )}
                  </div>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}