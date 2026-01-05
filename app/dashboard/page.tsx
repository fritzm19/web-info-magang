"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in, kick them back to login
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-blue-600">{session?.user?.name || session?.user?.email}</span>
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Application Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400 hover:shadow-md transition">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Application Status</h2>
            <p className="text-gray-600 mb-4 text-sm">
              You have not submitted your internship documents yet.
            </p>
            <button
                onClick={() => router.push("/dashboard/apply")}
                className="text-blue-600 font-semibold hover:underline text-sm"
            >
              Start Application &rarr;
            </button>
          </div>

          {/* Card 2: Profile */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-400 hover:shadow-md transition">
            <h2 className="text-xl font-bold text-gray-800 mb-2">My Profile</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Update your personal details and CV.
            </p>
            <button
                onClick={() => router.push("/dashboard/profile")} 
                className="text-blue-600 font-semibold hover:underline text-sm"
            >
              Edit Profile &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}