import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  // 1. Security Check: Who is sending this?
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("cv") as File | null;
    const fullName = formData.get("fullName") as string;
    const campus = formData.get("campus") as string;
    const major = formData.get("major") as string;
    const semester = formData.get("semester") as string;

    // --- LANGKAH BARU 1: Cek Data Existing ---
    // Kita cari dulu apakah user ini sudah punya lamaran?
    // Gunakan findFirst berdasarkan userId (kita ambil user via email session biar aman)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingApp = await prisma.application.findFirst({
        where: { userId: user.id }
    });

    // --- LANGKAH BARU 2: Validasi Status ---
    // Jika sudah ada DAN statusnya bukan PENDING (sudah diproses), tolak edit.
    if (existingApp && existingApp.status !== 'PENDING') {
        return NextResponse.json(
            { error: "Lamaran sudah diproses (Diterima/Ditolak), tidak dapat diedit lagi." }, 
            { status: 403 }
        );
    }

    // --- LANGKAH BARU 3: Handle File (Pintar) ---
    // Default: Gunakan CV lama jika ada (agar tidak tertimpa null)
    let finalCvUrl = existingApp?.cvUrl || null;

    // Hanya proses file jika user mengupload file BARU
    if (file && file.size > 0 && file.name !== "undefined") {
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            return NextResponse.json({ error: "File too large (Max 5MB)" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        // Sanitasi nama file biar aman
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueSuffix = Date.now();
        const filename = `${uniqueSuffix}-${cleanName}`;
        
        const uploadDir = join(process.cwd(), "public/uploads", filename);
        
        await writeFile(uploadDir, buffer);
        finalCvUrl = `/uploads/${filename}`; // Update variable dengan URL baru
    }

    // --- LANGKAH BARU 4: Update atau Create ---
    if (existingApp) {
        // UPDATE DATA LAMA
        await prisma.application.update({
            where: { id: existingApp.id },
            data: {
                fullName, 
                campus, 
                major, 
                semester, 
                cvUrl: finalCvUrl, // Gunakan URL final (bisa lama, bisa baru)
                // Status kita paksa jadi PENDING lagi kalau user update data, 
                // agar admin tau ada perubahan yang perlu direview ulang.
                status: "PENDING" 
            }
        });
    } else {
        // BUAT DATA BARU
        await prisma.application.create({
            data: {
                userId: user.id,
                fullName, 
                campus, 
                major, 
                semester, 
                cvUrl: finalCvUrl,
                status: "PENDING"
            }
        });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Something went wrong processing the application." }, { status: 500 });
  }
}