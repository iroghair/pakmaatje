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

    const { name, categoryId } = await req.json();

    if (!name || !categoryId) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const item = await prisma.item.create({
      data: {
        name,
        categoryId,
      },
      include: {
        assignee: true
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[ITEMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string, listId: string }> }) {
  try {
    const { id, listId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itemId, categoryId, packStatus, assigneeId, name } = await req.json();

    if (!itemId) {
      return new NextResponse("Item ID required", { status: 400 });
    }

    const item = await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(categoryId && { categoryId }),
        ...(packStatus && { packStatus }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(name && { name }),
      },
      include: {
        assignee: true
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[ITEMS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
