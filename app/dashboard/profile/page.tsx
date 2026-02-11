import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Mail, Building, Phone, Calendar, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Server Component (No 'use client')
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  // 1. Ambil Data Fresh dari Database
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session?.user?.id || "0") },
    include: { application: true } // Include data aplikasi jika butuh
  });

  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Profil Saya</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-[#1193b5] to-blue-400"></div>

        <div className="px-8 pb-8">
            {/* Avatar Section */}
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-50 overflow-hidden shadow-md flex items-center justify-center">
                     {user.avatarUrl ? (
                        <img 
                            src={user.avatarUrl} 
                            alt={user.name || "User"} 
                            className="object-cover w-full h-full"
                        />
                     ) : (
                        <User size={48} className="text-gray-300" />
                     )}
                </div>
                
                {/* Tombol Edit Shortcut ke Dashboard */}
                <Link href="/dashboard" className="mb-2 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-600 transition">
                    <Edit size={16} /> Edit Data
                </Link>
            </div>

            {/* Info Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500 font-medium mb-6">
                    {user.role === "ADMIN" ? "Administrator" : "Peserta Magang"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg"><Mail size={20} /></div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email</p>
                            <p className="text-gray-900 font-medium text-sm">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2.5 bg-green-100 text-green-600 rounded-lg"><Phone size={20} /></div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">No. WhatsApp</p>
                            <p className="text-gray-900 font-medium text-sm">{user.phone || "-"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg"><Building size={20} /></div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Instansi / Kampus</p>
                            <p className="text-gray-900 font-medium text-sm">{user.agency || "-"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2.5 bg-orange-100 text-orange-600 rounded-lg"><Calendar size={20} /></div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Bergabung Sejak</p>
                            <p className="text-gray-900 font-medium text-sm">
                                {new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
}