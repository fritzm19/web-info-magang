import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Admin sees ALL projects
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: {
        include: { user: { select: { name: true } } }
      }
    }
  });
  return NextResponse.json(projects);
}

// PATCH: Admin updates Deployment Link
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, deploymentUrl } = await req.json();

  const updated = await prisma.project.update({
    where: { id: id }, // ID is String (CUID)
    data: { deploymentUrl: deploymentUrl }
  });

  return NextResponse.json(updated);
}