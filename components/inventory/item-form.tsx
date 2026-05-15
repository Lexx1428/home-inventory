"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InventoryItem, ItemFormValues } from "./types";

const emptyValues: ItemFormValues = {
  name: "",
  category: "",
  location: "",
  quantity: 1,
  lowStockAt: 1,
  unit: "item",
  unitCost: 0,
  notes: "",
  expiresAt: ""
};

function valuesFromItem(item?: InventoryItem | null): ItemFormValues {
  if (!item) {
    return emptyValues;
  }

  return {
    name: item.name,
    category: item.category,
    location: item.location ?? "",
    quantity: item.quantity,
    lowStockAt: item.lowStockAt,
    unit: item.unit,
    unitCost: item.unitCost,
    notes: item.notes ?? "",
    expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : ""
  };
}

type ItemFormProps = {
  open: boolean;
  item?: InventoryItem | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ItemFormValues) => Promise<void>;
};

export function ItemForm({ open, item, saving, onOpenChange, onSubmit }: ItemFormProps) {
  const defaults = valuesFromItem(item);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await onSubmit({
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      location: String(formData.get("location") ?? ""),
      quantity: Number(formData.get("quantity") ?? 0),
      lowStockAt: Number(formData.get("lowStockAt") ?? 0),
      unit: String(formData.get("unit") ?? "item"),
      unitCost: Number(formData.get("unitCost") ?? 0),
      notes: String(formData.get("notes") ?? ""),
      expiresAt: String(formData.get("expiresAt") ?? "")
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit item" : "Add item"}</DialogTitle>
          <DialogDescription>Keep costs and stock thresholds current.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={defaults.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={defaults.category} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min="0" defaultValue={defaults.quantity} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockAt">Low stock at</Label>
              <Input id="lowStockAt" name="lowStockAt" type="number" min="0" defaultValue={defaults.lowStockAt} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" defaultValue={defaults.unit} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit cost</Label>
              <Input id="unitCost" name="unitCost" type="number" step="0.01" min="0" defaultValue={defaults.unitCost} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={defaults.location} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires</Label>
              <Input id="expiresAt" name="expiresAt" type="date" defaultValue={defaults.expiresAt} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" defaultValue={defaults.notes} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
