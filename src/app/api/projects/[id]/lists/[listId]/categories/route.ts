import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ listId: string }> }) {
  try {
    const { listId } = await params;
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

export async function PUT(req: Request, { params }: { params: Promise<{ listId: string }> }) {
  try {
    await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.status !== "APPROVED") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId, name } = await req.json();

    if (!categoryId || !name) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
