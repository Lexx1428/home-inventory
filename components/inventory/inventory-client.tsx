"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { InventoryDataTable } from "./data-table";
import { ItemForm } from "./item-form";
import type { InventoryItem, ItemFormValues } from "./types";

export function InventoryClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);

    const response = await fetch(`/api/items?${params.toString()}`);
    const data = await response.json();
    setItems(data.items);
    setCategories(data.categories);
    setLoading(false);
  }, [category, search]);

  useEffect(() => {
    const timeout = setTimeout(loadItems, 200);
    return () => clearTimeout(timeout);
  }, [loadItems]);

  const totalCost = useMemo(
    () => items.reduce((sum, item) => sum + item.totalCost, 0),
    [items]
  );
  const lowStockCount = items.filter((item) => item.quantity <= item.lowStockAt).length;

  function openCreateDialog() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function openEditDialog(item: InventoryItem) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  async function saveItem(values: ItemFormValues) {
    setSaving(true);
    const url = editingItem ? `/api/items/${editingItem.id}` : "/api/items";
    const method = editingItem ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    setSaving(false);

    if (response.ok) {
      setDialogOpen(false);
      await loadItems();
    }
  }

  async function updateQuantity(item: InventoryItem, quantity: number) {
    const response = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, quantity })
    });

    if (!response.ok) {
      return;
    }

    const updatedItem = await response.json();
    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === updatedItem.id ? updatedItem : currentItem
      )
    );
  }

  async function deleteItem(item: InventoryItem) {
    const confirmed = window.confirm(`Delete ${item.name}?`);
    if (!confirmed) return;

    await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    await loadItems();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Inventory</h1>
          <p className="mt-2 text-muted-foreground">
            Add, update, search, and restock household pantry items.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visible inventory value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visible items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-semibold">{lowStockCount}</div>
              {lowStockCount > 0 ? <Badge variant="destructive">Needs restock</Badge> : null}
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search items, locations, notes"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Filter category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((itemCategory) => (
              <SelectItem key={itemCategory} value={itemCategory}>
                {itemCategory}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading inventory...</CardContent>
        </Card>
      ) : (
        <InventoryDataTable
          data={items}
          onEdit={openEditDialog}
          onDelete={deleteItem}
          onQuantityChange={updateQuantity}
        />
      )}

      <ItemForm
        open={dialogOpen}
        item={editingItem}
        saving={saving}
        onOpenChange={setDialogOpen}
        onSubmit={saveItem}
      />
    </div>
  );
}
