// components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    agency: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal mendaftar");

      alert("Registrasi Berhasil! Silakan login.");
      router.push("/login");
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan sistem");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      
      {/* LEFT SIDE - Branding */}
      {/* MENGGUNAKAN bg-linear-to-br SESUAI REQUEST */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-600 to-blue-800 flex-col justify-between p-10 text-white relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="z-10 mt-10">
          <h1 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
             Bergabunglah Bersama Kami <br /> 
             Membangun Sulut Digital
          </h1>
          <p className="text-blue-100 text-base xl:text-lg max-w-md">
            Dapatkan pengalaman nyata di dunia kerja pemerintahan. Kembangkan skill, perluas relasi, dan berkontribusi langsung.
          </p>
        </div>

        <div className="z-10 text-xs xl:text-sm text-blue-200">
          &copy; 2026 DKIPSD Sulut. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - The Form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-4 overflow-y-auto">
        
        <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
            
            <div className="text-center mb-6">
                 <Link href="/" className="inline-block transition-opacity hover:opacity-80">
                      <Image
                          src="/sulut-icon.png" 
                          alt="Logo"
                          width={60}
                          height={60}
                          className="mx-auto object-contain mb-2"
                          unoptimized
                      />
                 </Link>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Buat Akun Baru</h2>
                <p className="text-sm text-gray-500 mt-1">Lengkapi data diri untuk memulai.</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700 mb-4 rounded-r">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Nama Lengkap */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nama Lengkap</label>
                    <input
                        name="name"
                        type="text"
                        required
                        placeholder="Sesuai KTP / KTM"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                {/* Grid 2 Kolom: Instansi & HP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Asal Kampus / Sekolah</label>
                        <input
                            name="agency"
                            type="text"
                            required
                            placeholder="Tulis nama lengkap instansi" 
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            value={formData.agency}
                            onChange={handleChange}
                        />
                         <p className="text-[10px] text-gray-400 mt-1">
                            *Contoh: Universitas Sam Ratulangi
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">No. WhatsApp</label>
                        <input
                            name="phone"
                            type="tel"
                            required
                            placeholder="08xxxxxxxxxx"
                            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Aktif</label>
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="email@mahasiswa.ac.id"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        placeholder="Minimal 6 karakter"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-sm px-5 py-2.5 text-center transition shadow-lg shadow-blue-500/30 disabled:opacity-50 mt-4"
                >
                    {isLoading ? "Memproses..." : "DAFTAR SEKARANG"}
                </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-bold text-blue-600 hover:underline">
                    Masuk di sini
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
}