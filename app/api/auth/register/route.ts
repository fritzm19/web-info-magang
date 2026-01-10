import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Tangkap data baru (phone & agency)
    const { name, email, password, phone, agency } = await req.json();

    // 2. Validasi input
    if (!name || !email || !password || !phone || !agency) {
      return NextResponse.json(
        { message: "Mohon lengkapi semua data (termasuk No. HP dan Asal Instansi)" },
        { status: 400 }
      );
    }

    // 3. Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    // 4. Enkripsi Password
    const hashedPassword = await hash(password, 10);

    // 5. Simpan User ke Database
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,   // <--- Simpan No HP
        agency,  // <--- Simpan Asal Instansi
        role: "USER",
      },
    });

    return NextResponse.json({ message: "Registrasi berhasil!" }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}