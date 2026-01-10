"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Calendar, School, User, BookOpen } from "lucide-react";

// Props: Data user (buat auto-fill)
interface ApplicationFormProps {
  user: {
    name: string;
    email: string;
    phone?: string | null;
    agency?: string | null;
  };
}

export default function ApplicationForm({ user }: ApplicationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    fullName: user.name || "",
    campus: user.agency || "",
    faculty: "",
    major: "",
    semester: "",
    startDate: "",
    endDate: "",
  });

  // State File (CV & Proposal)
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [proposalFile, setProposalFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "cv" | "proposal") => {
    if (e.target.files && e.target.files[0]) {
      if (type === "cv") setCvFile(e.target.files[0]);
      else setProposalFile(e.target.files[0]);
    }
  };

  // Fungsi Upload Helper
  const uploadFile = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    if (!res.ok) throw new Error("Gagal upload file");
    return (await res.json()).url; // Return URL file
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!cvFile || !proposalFile) {
        alert("Mohon upload CV dan Surat Pengantar (PDF)");
        setIsLoading(false);
        return;
      }

      // 1. Upload File
      // (Asumsi: File upload sudah berhasil karena error muncul di step berikutnya)
      let cvUrl = "";
      let proposalUrl = "";
      
      try {
          cvUrl = await uploadFile(cvFile);
          proposalUrl = await uploadFile(proposalFile);
      } catch (uploadErr) {
          throw new Error("Gagal mengupload file. Pastikan koneksi lancar.");
      }

      // 2. Submit Data Lamaran
      const payload = {
        ...formData,
        cvUrl,
        proposalUrl,
      };

      const res = await fetch("/api/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // --- PERBAIKAN DI SINI ---
      const data = await res.json(); // Baca respon JSON dari server

      if (!res.ok) {
        // Tampilkan pesan spesifik dari server (misal: "Format tanggal tidak valid")
        throw new Error(data.message || "Gagal mengirim lamaran");
      }

      // 3. Sukses
      router.refresh(); 
      alert("Lamaran berhasil dikirim!");

    } catch (error) {
      console.error(error);

      // Cek apakah error adalah instance dari object Error standar JavaScript
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan. Coba lagi.";
    
      // Tampilkan error asli ke user
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Lengkapi Berkas Magang</h2>
        <p className="text-gray-500">Isi formulir berikut untuk mengajukan permohonan magang.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: BIODATA & KAMPUS */}
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <h3 className="text-sm font-bold text-[#1193b5] uppercase mb-4 flex items-center gap-2">
                <User size={16} /> Data Diri & Akademik
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} required className="input-field" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Asal Instansi / Kampus</label>
                    <input name="campus" value={formData.campus} onChange={handleInputChange} required className="input-field" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Fakultas</label>
                    <input name="faculty" placeholder="Cth: Fakultas Teknik" value={formData.faculty} onChange={handleInputChange} required className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Jurusan</label>
                        <input name="major" placeholder="Informatika" value={formData.major} onChange={handleInputChange} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Semester</label>
                        <input name="semester" placeholder="Cth: 5" value={formData.semester} onChange={handleInputChange} required className="input-field" />
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION 2: PERIODE MAGANG */}
        <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100">
            <h3 className="text-sm font-bold text-orange-600 uppercase mb-4 flex items-center gap-2">
                <Calendar size={16} /> Rencana Periode Magang
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Mulai</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required className="input-field" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Selesai</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required className="input-field" />
                </div>
            </div>
        </div>

        {/* SECTION 3: UPLOAD BERKAS */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                <UploadCloud size={16} /> Upload Dokumen (PDF)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* CV Upload */}
                <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Curriculum Vitae (CV)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-white hover:border-blue-400 transition bg-white">
                        <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, "cv")} className="hidden" id="cv-upload" />
                        <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <FileText className={cvFile ? "text-blue-500" : "text-gray-400"} size={24} />
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                {cvFile ? cvFile.name : "Klik untuk upload CV"}
                            </span>
                        </label>
                    </div>
                </div>

                {/* Proposal Upload */}
                <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Surat Pengantar Kampus</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-white hover:border-blue-400 transition bg-white">
                        <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, "proposal")} className="hidden" id="proposal-upload" />
                        <label htmlFor="proposal-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <School className={proposalFile ? "text-blue-500" : "text-gray-400"} size={24} />
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                {proposalFile ? proposalFile.name : "Klik untuk upload Surat"}
                            </span>
                        </label>
                    </div>
                </div>

            </div>
        </div>

        <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1193b5] hover:bg-[#0e7a96] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-50"
        >
            {isLoading ? "Mengirim Data..." : "KIRIM LAMARAN MAGANG"}
        </button>

      </form>
      
      {/* Custom Style buat Input biar gak redundant */}
      <style jsx>{`
        .input-field {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
}