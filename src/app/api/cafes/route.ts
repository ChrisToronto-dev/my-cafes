import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const cafes = await prisma.cafe.findMany({
      include: {
        reviews: true,
        photos: true,
      },
    });

    const cafesWithAverageRatings = cafes.map(cafe => {
      const reviews = cafe.reviews;
      const numReviews = reviews.length;

      if (numReviews === 0) {
        return {
          ...cafe,
          averageRating: 0,
        };
      }

      const totalOverallRating = reviews.reduce((acc, review) => acc + (review.overallRating || 0), 0);
      
      return {
        ...cafe,
        averageRating: totalOverallRating / numReviews,
      };
    });

    return NextResponse.json(cafesWithAverageRatings, { status: 200 });
  } catch (error) {
    console.error("Get cafes error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const amenities = formData.get("amenities") as string;
    const photo = formData.get("photo") as File;

    if (!name || !address || !photo) {
      return NextResponse.json(
        { message: "Name, address, and photo are required" },
        { status: 400 }
      );
    }

    // Handle file upload
    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${photo.name}`;
    const filepath = path.join(process.cwd(), "public/uploads", filename);
    await writeFile(filepath, buffer);
    const photoUrl = `/uploads/${filename}`;

    const newCafe = await prisma.cafe.create({
      data: {
        name,
        address,
        description,
        amenities,
        userId: session.id,
        photos: {
          create: {
            url: photoUrl,
            userId: session.id,
          },
        },
      },
      include: {
        photos: true,
      },
    });

    return NextResponse.json(newCafe, { status: 201 });
  } catch (error) {
    console.error("Create cafe error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}