import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { saveUploadedFile } from "@/lib/upload";

// GET: Fetch All Projects
export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      members: { include: { user: { select: { name: true } } } }
    }
  });
  return NextResponse.json(projects);
}

// POST: Create New Project
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoLink = formData.get("repoLink") as string;
    const deploymentUrl = formData.get("deploymentUrl") as string;
    const memberIds = JSON.parse(formData.get("memberIds") as string || "[]");
    const file = formData.get("thumbnail") as File | null;

    let thumbnailUrl = null;
    if (file) {
        // Saves to: public/uploads/projects/
        thumbnailUrl = await saveUploadedFile(file, "projects"); 
    }

    // Prepare Members
    const membersToCreate = [{ userId: parseInt(session.user.id), role: "Leader" }];
    if (Array.isArray(memberIds)) {
      memberIds.forEach((id: number) => {
        if (id !== parseInt(session.user.id)) membersToCreate.push({ userId: id, role: "Member" });
      });
    }

    const project = await prisma.project.create({
      data: {
        title, description, repoLink, deploymentUrl, thumbnailUrl,
        visibility: "PUBLIC",
        members: { create: membersToCreate }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

// PATCH: Edit Existing Project
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const repoLink = formData.get("repoLink") as string;
    const deploymentUrl = formData.get("deploymentUrl") as string;
    const file = formData.get("thumbnail") as File | null;

    // Check ownership (Optional but recommended)
    // For now, we assume frontend handles visibility of Edit button

    const updateData: any = { title, description, repoLink, deploymentUrl };
    
    // Only update thumbnail if a NEW file is uploaded
    if (file) {
      updateData.thumbnailUrl = await saveFile(file);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}