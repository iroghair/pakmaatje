import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string, listId: string, categoryId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId, categoryId } = await params;
    const { name } = await req.json();

    if (!name) {
      return new NextResponse("Missing name", { status: 400 });
    }

    // Fetch the original category with all its items
    const originalCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        items: true
      }
    });

    if (!originalCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Duplicate category, resetting the counts for items
    const newCategory = await prisma.category.create({
      data: {
        listId: listId,
        name: name,
        items: {
          create: originalCategory.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            stagedCount: 0,
            packedCount: 0,
          }))
        }
      },
      include: {
        items: {
          include: {
            assignee: true
          }
        }
      }
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("CATEGORY_DUPLICATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
