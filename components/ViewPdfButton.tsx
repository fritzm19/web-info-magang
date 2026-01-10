"use client";

import { Eye, FileText } from "lucide-react";

interface ViewPdfButtonProps {
  url: string;
  label?: string;     // Opsional
  fileName?: string;  // Opsional
  variant?: "default" | "icon" | "icon-secondary"; // Tambahkan ini
}

export default function ViewPdfButton({ 
  url, 
  label = "Lihat PDF", 
  fileName, 
  variant = "default" 
}: ViewPdfButtonProps) {
  
  const handleView = () => {
    window.open(url, "_blank");
  };

  // 1. Tampilan Icon Only (Biru/Utama) - Untuk CV
  if (variant === "icon") {
    return (
      <button
        onClick={handleView}
        title={fileName || label}
        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center"
      >
        <FileText size={16} />
      </button>
    );
  }

  // 2. Tampilan Icon Only (Secondary/Abu) - Untuk Surat Pengantar
  if (variant === "icon-secondary") {
    return (
      <button
        onClick={handleView}
        title={fileName || label}
        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center"
      >
        <FileText size={16} />
      </button>
    );
  }

  // 3. Tampilan Default (Tombol Panjang dengan Teks) - Untuk Dashboard User
  return (
    <button
      onClick={handleView}
      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-[#1193b5] hover:border-blue-200 transition-all flex items-center gap-2 shadow-sm"
    >
      <Eye size={16} />
      {label}
    </button>
  );
}