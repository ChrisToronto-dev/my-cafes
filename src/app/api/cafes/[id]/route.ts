import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: any // { params: { id: string } } 대신 any 사용
) {
  const { id } = context.params;

  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { email: true },
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
    console.error("Get cafe error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any // { params: { id: string } } 대신 any 사용
) {
  const { id } = context.params;

  try {
    await prisma.cafe.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Cafe deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete cafe error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}