import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserAdminClient } from "@/components/user-admin-client";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await verifySession((await cookies()).get("session")?.value);

  if (!session) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, isActive: true }
  });

  if (!currentUser?.isActive || currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">User management</h1>
        <p className="mt-2 text-muted-foreground">
          Admins can create accounts and choose whether each person is an admin or user.
        </p>
      </div>
      <UserAdminClient users={users} />
    </div>
  );
}
