import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, listId: string }> }) {
  try {
    await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name: rawName, categoryId } = await req.json();
    let name = rawName;

    if (!name || !categoryId) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    let quantity = 1;
    // Extract quantity from name (e.g. "4x sleeping bag", "4 st tent", "4 sleeping bag")
    const qtyMatch = name.match(/^(\d+)\s*(?:x|st)?\s+(.+)$/i);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10);
      name = qtyMatch[2].trim();
    }

    const item = await prisma.item.create({
      data: {
        name,
        categoryId,
        quantity,
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
    await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { itemId, categoryId, quantity, stagedCount, packedCount, assigneeId, name } = await req.json();

    if (!itemId) {
      return new NextResponse("Item ID required", { status: 400 });
    }

    const item = await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(categoryId && { categoryId }),
        ...(quantity !== undefined && { quantity }),
        ...(stagedCount !== undefined && { stagedCount }),
        ...(packedCount !== undefined && { packedCount }),
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
