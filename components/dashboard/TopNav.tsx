"use client";

import { useState } from "react";
import { Menu, LogOut, Bell, User } from "lucide-react";
import { signOut } from "next-auth/react";
import MobileSidebar from "./MobileSidebar"; // We will create this next

export default function TopNav({ user }: { user: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
        {/* LEFT: Title / Breadcrumbs */}
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-gray-700 md:hidden">Portal Magang</h2>
          <h2 className="hidden md:block font-bold text-xl text-gray-800">Overview</h2>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Icon (Decoration) */}
          <button className="p-2 text-gray-400 hover:text-[#1193b5] transition relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* DESKTOP: Profile & Logout */}
          <div className="hidden md:flex items-center gap-4 pl-4 border-l border-gray-200">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-gray-700">{user?.name}</p>
              {/* <p className="text-xs text-gray-500">Peserta Magang</p> */}
            </div>
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-[#1193b5] font-bold">
               {user?.name?.[0] || <User size={18}/>}
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition"
              title="Logout"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>

          {/* MOBILE: Hamburger Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* The Mobile Sidebar Component */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        user={user} 
      />
    </>
  );
}