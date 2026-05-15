import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const itemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  location: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(0),
  unit: z.string().min(1),
  unitCost: z.coerce.number().min(0),
  notes: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();

  const items = await prisma.item.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } }
              ]
            }
          : {},
        category && category !== "all" ? { category } : {}
      ]
    },
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });

  const categories = await prisma.item.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" }
  });

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      unitCost: Number(item.unitCost),
      totalCost: Number(item.unitCost) * item.quantity
    })),
    categories: categories.map((item) => item.category)
  });
}

export async function POST(request: Request) {
  const parsed = itemSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Please check the item details." }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null
    }
  });

  return NextResponse.json({ ...item, unitCost: Number(item.unitCost) }, { status: 201 });
}
