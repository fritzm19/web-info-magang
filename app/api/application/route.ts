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
        startDate: startDate,
        endDate: endDate,
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

  } catch (error) { // HAPUS ': any'
    // Log error detail ke terminal server
    console.error("Submit Error Full:", error);
    
    // Type checking: apakah error ini object Error standar?
    const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan data ke database";
    
    // Kirim pesan error yang sudah divalidasi
    return NextResponse.json({ 
        message: errorMessage
    }, { status: 500 });
  }
}