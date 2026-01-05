"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      const session = await getSession();

      // @ts-expect-error: Custom role field
      if (session?.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* LEFT SIDE - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-linear-to-br from-blue-600 to-blue-800 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="z-10">
          <div className="flex gap-4 mb-8">
            <div className="bg-white/20 p-2 rounded text-xs font-bold backdrop-blur-sm">DINAS KOMINFO</div>
            <div className="bg-white/20 p-2 rounded text-xs font-bold backdrop-blur-sm">PEMKAB</div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Portal Magang & <br /> Penelitian
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            Sistem informasi berbasis web untuk mengelola proses pendaftaran, seleksi, dan administrasi magang secara digital.
          </p>
        </div>

        <div className="z-10 text-sm text-blue-200">
          &copy; 2026 Dinas Kominfo. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - The Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl">
          
          {/* HEADER SECTION: Clickable Logo */}
          <div className="text-center mb-8">
            {/* The Clickable Logo (Acts as Back Button) */}
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
                <Image
                    src="/sulut-icon.png"
                    alt="Portal Magang Logo"
                    width={150} // Adjust width as needed
                    height={60} // Adjust height as needed
                    className="mx-auto" // Centers the image horizontally
                    priority // Loads image immediately
                />
            </Link>

            {/* Form Sub-header */}
            <h2 className="text-2xl font-bold text-gray-900 mt-6 tracking-tight">
              Log In Akun
            </h2>
            <p className="mt-2 text-sm text-gray-600">
               Silakan masuk untuk melanjutkan
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email atau No. Handphone
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Ingat Saya
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Lupa password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "MASUK SEKARANG"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
              Daftar Magang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}