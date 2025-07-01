import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const cafes = await prisma.cafe.findMany({
      include: {
        reviews: true,
        photos: true,
      },
    });
    return NextResponse.json(cafes, { status: 200 });
  } catch (error) {
    console.error("Get cafes error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const name = data.get('name') as string;
    const address = data.get('address') as string;
    const description = data.get('description') as string;
    const photo = data.get('photo') as File;

    if (!name || !address || !photo) {
      return NextResponse.json(
        { message: "Name, address, and photo are required" },
        { status: 400 }
      );
    }

    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${photo.name}`;
    const path = join(process.cwd(), 'public/uploads', filename);
    await writeFile(path, buffer);
    const url = `/uploads/${filename}`;

    const newCafe = await prisma.$transaction(async (tx) => {
      const cafe = await tx.cafe.create({
        data: {
          name,
          address,
          description,
          userId: session.id, // Add userId here
        },
      });

      await tx.photo.create({
        data: {
          url,
          cafeId: cafe.id,
          userId: session.id, // Add userId here
        },
      });

      return cafe;
    });

    const cafeWithPhoto = await prisma.cafe.findUnique({
        where: { id: newCafe.id },
        include: { photos: true },
    });

    return NextResponse.json(cafeWithPhoto, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { message: 'A cafe with this name already exists.' },
          { status: 409 } // 409 Conflict
        );
      }
    }
    console.error("Create cafe error:", error.message, error.stack);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
