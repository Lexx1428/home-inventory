import { AlertTriangle, Boxes, DollarSign, ShoppingBasket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const items = await prisma.item.findMany({ orderBy: { updatedAt: "desc" } });
  const totalCost = items.reduce(
    (sum, item) => sum + Number(item.unitCost) * item.quantity,
    0
  );
  const lowStockItems = items.filter((item) => item.quantity <= item.lowStockAt);
  const categories = new Set(items.map((item) => item.category));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Current pantry value and items that need attention.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total pantry cost</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory items</CardTitle>
            <Boxes className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <ShoppingBasket className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{categories.size}</div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-xl font-semibold tracking-normal">Low stock</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            {lowStockItems.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No low-stock items right now.</p>
            ) : (
              <div className="divide-y">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.category} {item.location ? `- ${item.location}` : ""}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {item.quantity} {item.unit} left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
