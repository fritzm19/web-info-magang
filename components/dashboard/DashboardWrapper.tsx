"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, FileText, FolderGit2, User as UserIcon, LogOut, Menu, X, Bell } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

// API Call to lock/unlock menus based on accepted status
async function checkApplicationStatus() {
    try {
        const res = await fetch("/api/application/status");
        const data = await res.json();
        return data.status;
    } catch {
        return "PENDING";
    }
}

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [status, setStatus] = useState("PENDING"); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkApplicationStatus().then(setStatus);
  }, []);

  // Unlock menus if accepted OR if user is admin
  const isAccepted = status === "ACCEPTED" || session?.user?.role === "ADMIN";

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, visible: true },
    { name: "Profil Saya", href: "/dashboard/profile", icon: UserIcon, visible: true },
    { name: "Scan Presensi", href: "/dashboard/attendance", icon: Camera, visible: isAccepted },
    { name: "Izin / Sakit", href: "/dashboard/permission", icon: FileText, visible: isAccepted },
    { name: "Project", href: "/dashboard/projects", icon: FolderGit2, visible: isAccepted },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* --- 1. MOBILE OVERLAY (Darkens background when menu is open) --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- 2. THE SIDEBAR --- */}
      {/* Mobile: Fixed, hidden by default, slides in. Desktop: Relative, always visible */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        {/* Sidebar Branding */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between md:justify-start">
          <div>
            <h1 className="text-xl font-bold text-[#1193b5]">Portal Magang</h1>
            <p className="text-[10px] text-gray-400">Dinas Kominfo Sulut</p>
          </div>
          {/* Mobile Close 'X' Button */}
          <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Menus */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.filter(item => item.visible).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)} // Auto-close on mobile when clicked
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#1193b5] text-white shadow-md shadow-blue-200" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#1193b5]"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- 3. MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP HEADER (Replicates your existing desktop header) */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Button (Mobile Only) */}
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 hidden md:block">Overview</h2>
            <h2 className="text-lg font-bold text-[#1193b5] md:hidden">Portal Magang</h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Notification Bell */}
            <button className="text-gray-400 hover:text-[#1193b5] transition relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* User Profile Snippet (Desktop Only) */}
            <div className="hidden md:flex items-center gap-3 border-l border-gray-100 pl-6">
              <span className="text-sm font-bold text-gray-700">
                {session?.user?.name || "User"}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition ml-2 md:ml-4"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* ACTUAL PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}