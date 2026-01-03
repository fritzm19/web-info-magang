export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Portal Magang Dinas Kominfo</h1>
      <p className="mt-4 text-lg">Sistem Pendaftaran dan Monitoring Magang</p>

      <div className="mt-8 flex gap-4">
        <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Login
        </button>
        <button className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          Daftar Magang
        </button>
      </div>
    </main>
  );
}