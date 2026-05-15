export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  location: string | null;
  quantity: number;
  lowStockAt: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  notes: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemFormValues = {
  name: string;
  category: string;
  location: string;
  quantity: number;
  lowStockAt: number;
  unit: string;
  unitCost: number;
  notes: string;
  expiresAt: string;
};
