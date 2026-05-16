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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const parsed = itemSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Please check the item details." }, { status: 400 });
  }

  const { id } = await params;
  const item = await prisma.item.update({
    where: { id },
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null
    }
  });

  const unitCost = Number(item.unitCost);

  return NextResponse.json({
    ...item,
    unitCost,
    totalCost: unitCost * item.quantity
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
