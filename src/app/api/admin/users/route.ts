import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, status, role } = await req.json();

    if (!userId) {
      return new NextResponse("User ID required", { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(status && { status }),
        ...(role && { role }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[ADMIN_USERS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
