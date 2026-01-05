import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplicationTable from "./ApplicationTable";
import Link from "next/link"; // We can use Link or a client button for logout
import LogoutButton from "@/components/LogoutButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // @ts-expect-error: role check
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const applications = await prisma.application.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navbar / Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm">Welcome, {session.user?.name || "Admin"}</p>
          </div>
          <div className="flex gap-4 items-center">
             <LogoutButton />
          </div>
        </div>
        
        {/* The Interactive Table */}
        <ApplicationTable initialData={applications} />
      </div>
    </div>
  );
}