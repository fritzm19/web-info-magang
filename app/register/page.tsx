// app/register/page.tsx
import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

// Konfigurasi Metadata (Server Side)
export const metadata: Metadata = {
  title: "Daftar Akun",
  description: "Registrasi akun baru Portal Magang Dinas Kominfo Sulawesi Utara",
};

export default function RegisterPage() {
  return <RegisterForm />;
}