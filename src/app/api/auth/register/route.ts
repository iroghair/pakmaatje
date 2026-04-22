import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (!normalizedEmail || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    const isAdminEmail = normalizedEmail === process.env.ADMIN_EMAIL?.toLowerCase().trim();

    const user = await prisma.user.create({
      data: {
        name: normalizedName || null,
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role: isAdminEmail ? "ADMIN" : "USER",
        status: isAdminEmail ? "APPROVED" : "PENDING",
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[AUTH_REGISTER_POST]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
