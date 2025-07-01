import prisma from "../src/lib/db";

async function main() {
  console.log("Start seeding...");
  console.log("Prisma client:", prisma);

  try {
    // Create example cafes
    const cafe1 = await prisma.cafe.upsert({
      where: { name: "The Cozy Corner" },
      update: {},
      create: {
        name: "The Cozy Corner",
        address: "123 Main St, Anytown",
        description: "A warm and inviting cafe with great coffee and pastries.",
        averageRating: 4.5,
      },
    });

    const cafe2 = await prisma.cafe.upsert({
      where: { name: "Urban Brew" },
      update: {},
      create: {
        name: "Urban Brew",
        address: "456 Oak Ave, Cityville",
        description:
          "Modern cafe with specialty coffee and a vibrant atmosphere.",
        averageRating: 4.0,
      },
    });

    const cafe3 = await prisma.cafe.upsert({
      where: { name: "Bean There, Done That" },
      update: {},
      create: {
        name: "Bean There, Done That",
        address: "789 Pine Ln, Townsville",
        description:
          "Quirky cafe known for its unique blends and friendly staff.",
        averageRating: 4.8,
      },
    });

    console.log(`Created cafe: ${cafe1.name}`);
    console.log(`Created cafe: ${cafe2.name}`);
    console.log(`Created cafe: ${cafe3.name}`);

    const cafeCount = await prisma.cafe.count();
    console.log(`Total cafes in DB: ${cafeCount}`);
  } catch (opError) {
    console.error("Error during upsert operation:", opError);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Error in main function:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
