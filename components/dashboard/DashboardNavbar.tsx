"use client";

import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import LogoutButton from "../LogoutButton";

// Tambahkan interface untuk props
interface DashboardNavbarProps {
  hasApplied: boolean;
}

export default function DashboardNavbar({ hasApplied }: DashboardNavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-white h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100/50 shadow-sm">
      
      {/* KIRI: Judul Halaman (Dinamis) */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            {hasApplied ? "Overview" : "Pendaftaran Magang"}
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-1 hidden sm:block">
            {hasApplied 
                ? "Pantau progres dan status lamaran Anda secara real-time." 
                : "Lengkapi formulir di bawah ini untuk mengajukan permohonan."}
        </p>
      </div>

      {/* KANAN: User Info & Logout */}
      <div className="flex items-center gap-4">
        
        {/* Nama User (Hidden di HP) */}
        <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold text-gray-700">
                {session?.user?.name || "Peserta"}
            </span>
            <span className="text-xs text-gray-400">
                {session?.user?.email}
            </span>
        </div>

        {/* Icon Notifikasi (Hanya muncul jika sudah apply) */}
        {hasApplied && (
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative rounded-full hover:bg-gray-50">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
        )}
        
        <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

        <LogoutButton />
      </div>
    </header>
  );
}