import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const list = await prisma.packingList.create({
      data: {
        name,
        projectId: id,
      },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("[LISTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
