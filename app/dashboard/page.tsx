"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold text-blue-600">{session?.user?.name || session?.user?.email}</span>
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Application Status */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
            <h2 className="text-xl font-semibold mb-2">Application Status</h2>
            <p className="text-gray-600 mb-4">You have not submitted your internship documents yet.</p>
            <button className="text-blue-600 hover:underline">Start Application &rarr;</button>
          </div>

          {/* Card 2: Profile */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-400">
            <h2 className="text-xl font-semibold mb-2">My Profile</h2>
            <p className="text-gray-600 mb-4">Update your personal details and CV.</p>
            <button className="text-blue-600 hover:underline">Edit Profile &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );
}