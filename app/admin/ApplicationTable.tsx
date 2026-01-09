"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ViewCVButton from "@/components/ViewCVButton"; // <--- 1. Import Component ini

// Define the shape of our data
type Application = {
  id: number;
  fullName: string;
  campus: string;
  major: string;
  semester: string;
  cvUrl: string | null;
  status: string;
  user: { email: string };
};

export default function ApplicationTable({ initialData }: { initialData: Application[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<number | null>(null);

  const updateStatus = async (id: number, status: string) => {
    setIsLoading(id);
    try {
      await fetch("/api/application/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, newStatus: status }),
      });
      router.refresh();
    } catch (error) {
      alert("Failed to update status");
    } finally { 
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Candidate</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Education</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Documents</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {initialData.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No applications yet.</td></tr>
          ) : (
            initialData.map((app) => (  // <--- Variabelnya bernama 'app'
              <tr key={app.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{app.fullName}</div>
                  <div className="text-xs text-gray-500">{app.user.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {app.campus}<br />
                  <span className="text-xs">{app.major} • Sem {app.semester}</span>
                </td>
                
                {/* --- BAGIAN INI YANG DIPERBAIKI --- */}
                <td className="px-6 py-4">
                  {app.cvUrl ? (
                    // Ganti <a> lama dengan Component ViewCVButton
                    // Pastikan pakai 'app.cvUrl' dan 'app.fullName'
                    <ViewCVButton 
                        cvUrl={app.cvUrl} 
                        fileName={`CV_${app.fullName}.pdf`} 
                    />
                  ) : (
                    <span className="text-gray-400 text-sm italic">No CV Uploaded</span>
                  )}
                </td>
                {/* ---------------------------------- */}

                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {isLoading === app.id ? (
                    <span className="text-xs text-gray-500">Updating...</span>
                  ) : (
                    <>
                      <button 
                        onClick={() => updateStatus(app.id, "ACCEPTED")}
                        className="text-green-600 hover:text-green-900 text-xs font-bold border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => updateStatus(app.id, "REJECTED")}
                        className="text-red-600 hover:text-red-900 text-xs font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}