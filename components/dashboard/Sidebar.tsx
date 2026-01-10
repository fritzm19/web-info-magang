"use client";

import { Session } from "next-auth";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User } from "lucide-react"; 
import Link from "next/link";

export default function Sidebar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  // HAPUS "Formulir Magang", sisa Dashboard saja
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 bg-[#1193b5] text-white hidden md:flex flex-col sticky top-0 h-screen z-40 shadow-xl">
      
      {/* HEADER */}
      <div className="h-20 flex flex-col justify-center px-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">Portal Magang</h1>
        <p className="text-xs text-blue-100 opacity-80 mt-1">Dinas Kominfo Sulut</p>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all ${
               isActive(item.href) 
                ? "bg-white/20 text-white shadow-sm" 
                : "text-blue-50 hover:bg-white/10 hover:text-white"
            }`}
          >
            <item.icon size={20} /> 
            {item.name}
          </Link>
        ))}
      </nav>

      {/* FOOTER PROFILE */}
      <div className="p-4 border-t border-white/10 bg-[#0e7a96]">
        <Link href="/dashboard/profile" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border border-white/30 shrink-0 group-hover:bg-white/30 transition">
                {session?.user?.name?.[0]?.toUpperCase() || <User size={20} />}
            </div>
            
            <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-white leading-tight">
                    {session?.user?.name?.split(" ")[0]}
                </p>
                <p className="text-[10px] text-blue-200 group-hover:text-white transition-colors">
                    Lihat Profil
                </p>
            </div>
        </Link>
      </div>
    </aside>
  );
}