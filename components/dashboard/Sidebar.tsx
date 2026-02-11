"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, FileText, FolderGit2, User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

// Helper to check status (Simple version)
// In a real app, you might want to pass this status down from a parent layout
// or put it in the NextAuth session.
async function checkApplicationStatus() {
    try {
        const res = await fetch("/api/application/status"); // You'll need this simple API
        const data = await res.json();
        return data.status; // "PENDING", "ACCEPTED", "REJECTED"
    } catch {
        return "PENDING";
    }
}

export default function Sidebar() {
  const pathname = usePathname();
  const [status, setStatus] = useState("PENDING"); 
  
  useEffect(() => {
    checkApplicationStatus().then(setStatus);
  }, []);

  // Determine if user has full access
  const isAccepted = status === "ACCEPTED"; // Or checking if role === "ADMIN"

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, visible: true },
        
    // RESTRICTED MENUS
    { name: "Scan Presensi", href: "/dashboard/attendance", icon: Camera, visible: isAccepted },
    { name: "Izin / Sakit", href: "/dashboard/permission", icon: FileText, visible: isAccepted },
    { name: "Project", href: "/dashboard/projects", icon: FolderGit2, visible: isAccepted },

    { name: "Profil Saya", href: "/dashboard/profile", icon: User, visible: true }, // Always visible
  ];

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#1193b5]">Portal Magang</h1>
        <p className="text-xs text-gray-400 mt-1">Dinas Kominfo Sulut</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.filter(item => item.visible).map((item) => {
            const isActive = pathname === item.href;
            return (
                <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive 
                        ? "bg-[#1193b5] text-white shadow-md shadow-blue-200" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-[#1193b5]"
                    }`}
                >
                    <item.icon size={20} />
                    {item.name}
                </Link>
            )
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100">
        <button 
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition"
        >
            <LogOut size={20} />
            Keluar
        </button>
      </div>
    </aside>
  );
}