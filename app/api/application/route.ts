import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  // 1. Security Check: Who is sending this?
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

try {
    const formData = await request.formData();
    const file = formData.get("cv") as File | null; // Allow null
    const fullName = formData.get("fullName") as string;
    const campus = formData.get("campus") as string;
    const major = formData.get("major") as string;
    const semester = formData.get("semester") as string;

    let publicUrl = null;

    // ONLY process file if one was uploaded
    if (file && file.size > 0 && file.name !== "undefined") {
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (Max 5MB)" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${uniqueSuffix}-${file.name.replace(/\s/g, "_")}`;
        const uploadDir = join(process.cwd(), "public/uploads", filename);
        
        await writeFile(uploadDir, buffer);
        publicUrl = `/uploads/${filename}`;
    }

    // Save to DB (cvUrl might be null now, which is allowed)
    await prisma.application.upsert({
      where: {
        // @ts-expect-error: session.user.id conversion
        userId: parseInt(session.user.id), 
      },
      update: {
        fullName, campus, major, semester, cvUrl: publicUrl, status: "PENDING"
      },
      create: {
        // @ts-expect-error: session.user.id conversion
        userId: parseInt(session.user.id),
        fullName, campus, major, semester, cvUrl: publicUrl
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Something went wrong processing the application." }, { status: 500 });
  }
}