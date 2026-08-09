import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().optional(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "USER"]).default("USER")
});

async function getAdmin(request: NextRequest) {
  const session = await verifySession(request.cookies.get("session")?.value);

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isActive: true }
  });

  return user?.isActive && user.role === "ADMIN" ? user : null;
}

export async function POST(request: NextRequest) {
  const admin = await getAdmin(request);

  if (!admin) {
    return NextResponse.json({ message: "Admins only." }, { status: 403 });
  }

  const parsed = userSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the user details. Passwords need at least 8 characters." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name || null,
        passwordHash,
        role: parsed.data.role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "A user with that email already exists." }, { status: 409 });
    }

    throw error;
  }
}
