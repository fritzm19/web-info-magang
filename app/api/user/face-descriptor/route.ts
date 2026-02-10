import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { faceDescriptor: true, name: true }
  });

  return NextResponse.json({ 
    hasFace: !!user?.faceDescriptor, 
    descriptor: user?.faceDescriptor ? JSON.parse(user.faceDescriptor) : null,
    name: user?.name
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { descriptor } = body; // This is the array of numbers

  if (!descriptor) return NextResponse.json({ error: "No face data provided" }, { status: 400 });

  await prisma.user.update({
    where: { id: parseInt(session.user.id) },
    data: { faceDescriptor: JSON.stringify(descriptor) }
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt(session.user.id);

  // 1. Delete Face Data
  await prisma.user.update({
    where: { id: userId },
    data: { faceDescriptor: null }
  });

  // 2. Delete Today's Attendance (So you can check in again)
  const today = new Date();
  today.setHours(0,0,0,0);
  
  await prisma.attendance.deleteMany({
    where: { 
      userId: userId,
      date: { gte: today }
    }
  });

  return NextResponse.json({ success: true });
}