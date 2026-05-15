import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Package2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession((await cookies()).get("session")?.value);

  if (!session) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, name: true, role: true, isActive: true }
  });

  if (!currentUser?.isActive) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-5 w-5 text-primary" />
            Home Inventory
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="rounded-md px-3 py-2 hover:bg-accent" href="/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-md px-3 py-2 hover:bg-accent" href="/inventory">
              Inventory
            </Link>
            {currentUser.role === "ADMIN" ? (
              <Link className="rounded-md px-3 py-2 hover:bg-accent" href="/users">
                Users
              </Link>
            ) : null}
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-44 truncate text-muted-foreground">
                {currentUser.name || currentUser.email}
              </span>
              <Badge variant={currentUser.role === "ADMIN" ? "default" : "secondary"}>
                {currentUser.role === "ADMIN" ? "Admin" : "User"}
              </Badge>
            </div>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
