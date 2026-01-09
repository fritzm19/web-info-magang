"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Settings } from "lucide-react";

export default function Sidebar({ session }: { session: Session | null }) {
  const router = useRouter();
  const pathname = usePathname(); // Untuk highlight menu aktif

  // Helper untuk cek active state
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-[#1193b5] text-white hidden md:flex flex-col shadow-xl z-10 sticky top-0 h-screen">
      <div className="h-24 flex flex-col justify-center px-6 border-b border-white/20">
        <h2 className="text-2xl font-bold tracking-tight">Portal Magang</h2>
        <p className="text-xs text-blue-100 opacity-80 mt-1">Dinas Kominfo Sulut</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => router.push("/dashboard")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${
            isActive("/dashboard") ? "bg-white/20 shadow-sm" : "hover:bg-white/10 text-blue-50"
          }`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>

        <button
          onClick={() => router.push("/dashboard/apply")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition ${
            isActive("/dashboard/apply") ? "bg-white/20 shadow-sm" : "hover:bg-white/10 text-blue-50"
          }`}
        >
          <FileText size={20} /> Formulir Magang
        </button>
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={() => router.push("/dashboard/profile")}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/10 transition-colors text-left group"
        >
          <div className="w-10 h-10 rounded-full bg-white text-[#1193b5] flex items-center justify-center font-bold text-lg shadow-sm">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-blue-200 truncate group-hover:text-white">Edit Profil</p>
          </div>
          <Settings size={16} className="text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </aside>
  );
}