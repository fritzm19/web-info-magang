"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 1. Collect form data
    const formData = new FormData(e.currentTarget);

    try {
      // 2. Send to our API
      const res = await fetch("/api/application", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // 3. Success! Go back to dashboard
      alert("Application Submitted Successfully!");
      router.push("/dashboard");
      router.refresh();

    } catch (error) {
      // We check if the error is actually a standard Error object
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Formulir Pendaftaran
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Silakan lengkapi data diri dan upload CV terbaru Anda.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              name="fullName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Campus & Major */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Asal Kampus</label>
              <input
                name="campus"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jurusan</label>
              <input
                name="major"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Semester Saat Ini</label>
            <select
              name="semester"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>Semester {num}</option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload CV (PDF Max 5MB)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="cv-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input 
                        id="cv-upload" 
                        name="cv" 
                        type="file" 
                        accept="application/pdf"
                        // required
                        className="sr-only" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                    {file ? `Selected: ${file.name}` : "PDF up to 5MB"}
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-1/3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Mengirim..." : "Kirim Lamaran"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}