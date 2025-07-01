import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        photos: true,
      },
    });

    if (!cafe) {
      return NextResponse.json({ message: "Cafe not found" }, { status: 404 });
    }

    return NextResponse.json(cafe, { status: 200 });
  } catch (error) {
    console.error("Get cafe by ID error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id },
    });

    if (!cafe) {
      return NextResponse.json({ message: "Cafe not found" }, { status: 404 });
    }

    if (cafe.userId !== session.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.cafe.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cafe deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete cafe error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = await getSession();

  if (!session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id },
    });

    if (!cafe) {
      return NextResponse.json({ message: "Cafe not found" }, { status: 404 });
    }

    if (cafe.userId !== session.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, address, description } = await request.json();

    if (!name || !address) {
      return NextResponse.json(
        { message: "Name and address are required" },
        { status: 400 }
      );
    }

    const updatedCafe = await prisma.cafe.update({
      where: { id },
      data: {
        name,
        address,
        description,
      },
    });

    return NextResponse.json(updatedCafe, { status: 200 });
  } catch (error) {
    console.error("Update cafe error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}