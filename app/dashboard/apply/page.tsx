"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/Header";
import { Save, UploadCloud, AlertCircle } from "lucide-react";

export default function ApplyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Penanda Edit Mode

  const [formData, setFormData] = useState({
    fullName: "",
    campus: "",
    major: "",
    semester: "",
  });

  // 1. FETCH DATA LAMA SAAT PAGE LOAD
  useEffect(() => {
    async function fetchExistingData() {
      try {
        const res = await fetch("/api/application/me");
        if (res.ok) {
          const data = await res.json();
          // Jika ada data (artinya edit mode), isi formulir
          if (data) {
            setIsEditMode(true);
            setFormData({
                fullName: data.fullName || "",
                campus: data.campus || "",
                major: data.major || "",
                semester: data.semester || "",
            });
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data lama", err);
      }
    }
    fetchExistingData();
  }, []);

  // Handler untuk mengubah isi form saat diketik
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/application", {
        method: "POST", // Method POST di handle API kita tadi sudah handle Update/Create
        body: form,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mengirim lamaran");

      alert(isEditMode ? "Data berhasil diperbarui!" : "Lamaran berhasil dikirim!");
      router.push("/dashboard");
      router.refresh(); // Refresh biar status di dashboard berubah
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DashboardHeader title="Formulir Magang" subtitle="Isi data diri dan upload CV Anda." />
      
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
            
            {/* Input fields... (sama seperti sebelumnya) */}
        
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  required
                  name="fullName"
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="Sesuai KTP" />
            </div>

            {/* ... input campus, major, semester ... */}    
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Universitas / Sekolah</label>
                <input
                  required 
                  name="major" 
                  type="text" 
                  className="w-full p-3 border rounded-lg" 
                  value={formData.major}
                  onChange={handleChange}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <input
                  required 
                  name="semester" 
                  type="number" 
                  className="w-full p-3 border rounded-lg" 
                  value={formData.semester}
                  onChange={handleChange}
                />
            </div>

            {/* Input File */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload CV (PDF)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer relative">
                    <input type="file" name="cv" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                    <UploadCloud size={32} className="mb-2 text-[#1193b5]" />
                    <p className="text-sm">Klik atau tarik file ke sini</p>
                    <p className="text-xs text-gray-400 mt-1">Maks 2MB .PDF</p>
                </div>
            </div>

            <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p>
                    Jika Anda sudah pernah mengirim data sebelumnya, formulir ini akan <strong>mengupdate</strong> data lama Anda (selama status masih Pending).
                </p>
            </div>

            <button 
                disabled={isSubmitting}
                type="submit" 
                className="w-full bg-[#1193b5] hover:bg-[#0e7a96] text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
                {isSubmitting ? "Memproses..." : (
                    <><Save size={20} /> Simpan & Kirim</>
                )}
            </button>
        </form>
      </div>
    </>
  );
}