import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, image } = await req.json();

    const normalizedName = typeof name === "string" ? name.trim() : "";

    if (!normalizedName) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    if (typeof image !== "string" || !image.startsWith("data:image/svg+xml")) {
      return NextResponse.json({ message: "Invalid avatar image." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: normalizedName,
        image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[USERS_ME_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
