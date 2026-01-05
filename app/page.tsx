import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/">
            <Image
                src="/sulut-dark.png"
                alt="Portal Magang Logo"
                width={250}
                height={50}
            />
          </Link>
          
          <div className="flex gap-4">
            {session ? (
              <Link 
                href="/dashboard"
                className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2"
                >
                  Masuk
                </Link>
                <Link 
                  href="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <main className="grow flex items-center justify-center bg-linear-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="bg-blue-100 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full mb-6 inline-block">
            Open for Batch 2026
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Start Your Career Journey <br />
            <span className="text-blue-600">With Us Today.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Apply for internships at Dinas Kominfo. Gain real-world experience, 
            work on impactful projects, and build your professional network.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link 
                href="/dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Check Application Status
              </Link>
            ) : (
              <Link 
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Apply for Internship 🚀
              </Link>
            )}
            <a 
                href="#features"
                className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition"
            >
                Learn More
            </a>
          </div>
        </div>
      </main>

      {/* 3. Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real Projects</h3>
                    <p className="text-gray-500">Don&apos;t just fetch coffee. Work on real government applications and data systems.</p>
                </div>
                <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl mb-4">🤝</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mentorship</h3>
                    <p className="text-gray-500">Get guided by senior developers and civil servants throughout your internship.</p>
                </div>
                <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-4">📜</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Certification</h3>
                    <p className="text-gray-500">Receive an official certificate of completion from the Dinas upon finishing.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 Dinas Kominfo. Internship Portal Project.</p>
        </div>
      </footer>
    </div>
  );
}