"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Session } from "next-auth"; // Import tipe Session
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  LogOut,
  Shield
} from "lucide-react";
import { signOut } from "next-auth/react";

// --- PERBAIKAN DI SINI ---
// Ubah interface agar menerima 'session', bukan 'application'
interface AdminSidebarProps {
  session: Session | null;
}

export default function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/applications", label: "Permohonan", icon: FileText },
    { href: "/admin/users", label: "Pengguna", icon: Users },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#1e293b] text-white h-screen shrink-0 sticky top-0">
      
      {/* Header Sidebar */}
      <div className="p-6 border-b border-gray-700 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-lg">
            <Shield size={24} className="text-white"/>
        </div>
        <div>
            <h1 className="font-bold text-lg tracking-wide">Admin Panel</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Diskominfo</p>
        </div>
      </div>

      {/* User Info (Dari Session) */}
      <div className="px-6 py-6">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Login sebagai:</p>
            <p className="text-sm font-bold truncate">{session?.user?.name || "Admin"}</p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition text-sm font-medium"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}