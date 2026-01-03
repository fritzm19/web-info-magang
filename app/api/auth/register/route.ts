import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // This still works because of path aliases
import { hash } from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // 1. Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // 2. Hash password
    const hashedPassword = await hash(password, 10);

    // 3. Save to Laragon MySQL
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error occurred" },
      { status: 500 }
    );
  }
}