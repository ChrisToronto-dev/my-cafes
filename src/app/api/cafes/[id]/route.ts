import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

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

    const reviews = cafe.reviews;
    const numReviews = reviews.length;

    if (numReviews === 0) {
      return NextResponse.json({
        ...cafe,
        averageRating: 0,
        averageLocationRating: 0,
        averagePriceRating: 0,
        averageCoffeeRating: 0,
        averageBakeryRating: 0,
      }, { status: 200 });
    }

    const totalOverallRating = reviews.reduce((acc, review) => acc + (review.overallRating || 0), 0);
    const totalLocationRating = reviews.reduce((acc, review) => acc + (review.locationRating || 0), 0);
    const totalPriceRating = reviews.reduce((acc, review) => acc + (review.priceRating || 0), 0);
    const totalCoffeeRating = reviews.reduce((acc, review) => acc + (review.coffeeRating || 0), 0);
    const totalBakeryRating = reviews.reduce((acc, review) => acc + (review.bakeryRating || 0), 0);

    const cafeWithAverageRatings = {
      ...cafe,
      averageRating: totalOverallRating / numReviews,
      averageLocationRating: totalLocationRating / numReviews,
      averagePriceRating: totalPriceRating / numReviews,
      averageCoffeeRating: totalCoffeeRating / numReviews,
      averageBakeryRating: totalBakeryRating / numReviews,
    };

    return NextResponse.json(cafeWithAverageRatings, { status: 200 });
  } catch (error) {
    console.error("Get cafe error:", error);
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
  const session = await getSession();
  if (!session.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const amenities = formData.get("amenities") as string;
    const photo = formData.get("photo") as File | null;

    let photoUrl: string | undefined;

    if (photo) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${photo.name}`;
      const filepath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(filepath, buffer);
      photoUrl = `/uploads/${filename}`;
    }

    const updatedCafe = await prisma.cafe.update({
      where: { id },
      data: {
        name,
        address,
        description,
        amenities,
        ...(photoUrl && { 
          photos: {
            deleteMany: {},
            create: {
              url: photoUrl,
              userId: session.id,
            },
          }
        }),
      },
      include: {
        photos: true,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

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