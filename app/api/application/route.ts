import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Cek Session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      console.error("API Error: No Session/User Email");
      return NextResponse.json({ message: "Anda harus login terlebih dahulu (Unauthorized)" }, { status: 401 });
    }

    // 2. Baca Body
    const body = await req.json();

    // 3. Validasi Tanggal (Cegah Invalid Date)
    // Jika user kirim string kosong "", new Date() akan error/invalid di Prisma
    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;

    if (!startDate || isNaN(startDate.getTime()) || !endDate || isNaN(endDate.getTime())) {
       return NextResponse.json({ message: "Format tanggal tidak valid. Mohon isi tanggal dengan benar." }, { status: 400 });
    }

    // 4. Cari User ID
    const user = await prisma.user.findUnique({ 
        where: { email: session.user.email } 
    });

    if (!user) {
        return NextResponse.json({ message: "Data user tidak ditemukan di database" }, { status: 404 });
    }

    console.log("Saving application for:", user.email);

    // 5. Simpan ke Database
    const application = await prisma.application.upsert({
      where: { userId: user.id },
      update: {
        fullName: body.fullName,
        campus: body.campus,
        faculty: body.faculty,
        major: body.major,
        semester: body.semester,
        startDate: startDate, // Gunakan variabel yang sudah divalidasi
        endDate: endDate,     // Gunakan variabel yang sudah divalidasi
        cvUrl: body.cvUrl,
        proposalUrl: body.proposalUrl,
        status: "PENDING",
      },
      create: {
        userId: user.id,
        fullName: body.fullName,
        campus: body.campus,
        faculty: body.faculty,
        major: body.major,
        semester: body.semester,
        startDate: startDate,
        endDate: endDate,
        cvUrl: body.cvUrl,
        proposalUrl: body.proposalUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Berhasil disimpan", data: application });

  } catch (error: any) {
    // Log error detail ke terminal server (PENTING BUAT DEBUG)
    console.error("Submit Error Full:", error);
    
    // Kirim pesan error asli ke frontend
    return NextResponse.json({ 
        message: error.message || "Gagal menyimpan data ke database" 
    }, { status: 500 });
  }
}