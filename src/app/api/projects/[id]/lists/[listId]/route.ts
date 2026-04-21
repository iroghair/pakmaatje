import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ listId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = await params;
    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Missing name", { status: 400 });
    }

    const list = await prisma.packingList.update({
      where: { id: listId },
      data: { name },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("LIST_PUT_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
