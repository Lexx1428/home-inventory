import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_USER_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_USER_PASSWORD ?? "change-me-now";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Home Admin", passwordHash }
  });

  const existingItems = await prisma.item.count();

  if (existingItems === 0) {
    await prisma.item.createMany({
      data: [
        {
          name: "Jasmine Rice",
          category: "Grains",
          location: "Pantry",
          quantity: 2,
          lowStockAt: 1,
          unit: "bag",
          unitCost: "12.50",
          notes: "5 lb bags"
        },
        {
          name: "Black Beans",
          category: "Canned Goods",
          location: "Pantry",
          quantity: 5,
          lowStockAt: 3,
          unit: "can",
          unitCost: "1.35"
        },
        {
          name: "Olive Oil",
          category: "Cooking",
          location: "Cabinet",
          quantity: 1,
          lowStockAt: 2,
          unit: "bottle",
          unitCost: "11.99"
        }
      ]
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
