import { prisma } from "@/lib/prisma";
import { User as UserIcon, Shield, UserCog, Mail, Phone, Building2 } from "lucide-react";

export default async function AdminUsersPage() {
  // Fetch all users and include their application status
  const users = await prisma.user.findMany({
    include: { application: { select: { status: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola akun dan hak akses seluruh peserta magang serta admin.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama & Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Instansi</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Face ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {u.name?.charAt(0).toUpperCase() || <UserIcon size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{u.name || "N/A"}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={12}/> {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {u.role === 'ADMIN' ? <Shield size={10}/> : <UserCog size={10}/>}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                       <Building2 size={14} className="text-gray-300"/> {u.agency || "Belum diisi"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`text-[10px] font-bold ${u.faceDescriptor ? 'text-green-500' : 'text-gray-300'}`}>
                      {u.faceDescriptor ? "TERDAFTAR" : "BELUM ADA"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-[#1193b5] hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}