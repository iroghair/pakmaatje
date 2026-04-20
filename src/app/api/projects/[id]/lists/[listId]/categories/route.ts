import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, listId: string }> }) {
  try {
    const { id, listId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        listId,
      },
      include: {
        items: { include: { assignee: true } }
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
