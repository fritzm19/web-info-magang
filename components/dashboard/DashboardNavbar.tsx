"use client";

import { Bell } from "lucide-react";
import LogoutButton from "../LogoutButton";

export default function DashboardNavbar() {
  return (
    <header className="bg-white h-20 px-8 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100/50">
      
      {/* KIRI: Judul Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Pantau status pendaftaran magang Anda di sini.
        </p>
      </div>

      {/* KANAN: Notifikasi & Logout */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative rounded-full hover:bg-gray-100">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

        <LogoutButton />
      </div>
    </header>
  );
}