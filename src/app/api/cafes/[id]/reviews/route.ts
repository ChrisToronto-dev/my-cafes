import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  context: any // { params: { id: string } } 대신 any 사용
) {
  const { id } = context.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { cafeId: id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: any // { params: { id: string } } 대신 any 사용
) {
  const { id: cafeId } = context.params;

  try {
    const session = await getSession();
    if (!session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const text = data.get('text') as string;
    const overallRating = parseFloat(data.get('overallRating') as string);
    const locationRating = parseFloat(data.get('locationRating') as string);
    const priceRating = parseFloat(data.get('priceRating') as string);
    const coffeeRating = parseFloat(data.get('coffeeRating') as string);
    const bakeryRating = parseFloat(data.get('bakeryRating') as string);

    if (!overallRating || !text) {
      return NextResponse.json(
        { message: "Overall rating and text are required" },
        { status: 400 }
      );
    }

    const newReview = await prisma.review.create({
      data: {
        text,
        overallRating: Math.round(overallRating),
        locationRating: Math.round(locationRating || 0),
        priceRating: Math.round(priceRating || 0),
        coffeeRating: Math.round(coffeeRating || 0),
        bakeryRating: Math.round(bakeryRating || 0),
        userId: session.id,
        cafeId,
      },
    });

    // Update average rating for the cafe
    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
      include: { reviews: true },
    });

    if (cafe) {
      const totalRating = cafe.reviews.reduce(
        (sum, review) => sum + review.overallRating,
        0
      );
      const newAverageRating =
        (totalRating + Math.round(overallRating)) / (cafe.reviews.length + 1);

      await prisma.cafe.update({
        where: { id: cafeId },
        data: { averageRating: newAverageRating },
      });
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}