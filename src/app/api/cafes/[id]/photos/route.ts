import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  request: NextRequest,
  context: any // { params: { id: string } } 대신 any 사용
) {
  const { id: cafeId } = context.params;
  const { url } = await request.json();

  try {
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!url) {
      return NextResponse.json(
        { message: "Image URL is required" },
        { status: 400 }
      );
    }

    const newPhoto = await prisma.photo.create({
      data: {
        url,
        cafeId,
      },
    });

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}