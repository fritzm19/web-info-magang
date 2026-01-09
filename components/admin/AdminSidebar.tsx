// components/admin/AdminSidebar.tsx
"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Settings, Shield } from "lucide-react";

export default function AdminSidebar({ session }: { session: Session | null }) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-[#1e293b] text-white hidden md:flex flex-col shadow-xl z-20 sticky top-0 h-screen">
      {/* Warna Background Admin dibedakan sedikit (Dark Slate) biar berasa "Power"-nya, 
          atau ganti ke bg-[#1193b5] jika ingin seragam persis dengan User */}
      
      {/* Header Sidebar */}
      <div className="h-24 flex flex-col justify-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#1193b5]">
            <Shield size={24} className="text-white"/> 
            <h2 className="text-xl font-bold tracking-tight text-white">Admin Panel</h2>
        </div>
        <p className="text-xs text-gray-400 mt-1">Administrator Mode</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => router.push("/admin")}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${
            isActive("/admin") ? "bg-[#1193b5] text-white shadow-md" : "hover:bg-white/5 text-gray-300"
          }`}
        >
          <LayoutDashboard size={20} /> Overview
        </button>

        {/* Menu Dummy (Untuk pengembangan selanjutnya) */}
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 transition cursor-not-allowed opacity-60">
          <Users size={20} /> Manage Users
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 transition cursor-not-allowed opacity-60">
          <Settings size={20} /> Settings
        </button>
      </nav>

      {/* User Info Bawah */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1193b5] flex items-center justify-center font-bold text-lg text-white shadow-sm">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate text-white">{session?.user?.name || "Admin"}</p>
            <p className="text-xs text-gray-400 truncate">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}