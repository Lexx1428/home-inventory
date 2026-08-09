"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowUpDown, Check, Filter, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { InventoryItem } from "./types";

type InventoryDataTableProps = {
  data: InventoryItem[];
  categories: string[];
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onQuantityChange: (item: InventoryItem, nextQuantity: number) => void;
};

export function InventoryDataTable({
  data,
  categories,
  categoryFilter,
  onCategoryFilterChange,
  onEdit,
  onDelete,
  onQuantityChange
}: InventoryDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Item
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.notes ? <p className="text-xs text-muted-foreground">{row.original.notes}</p> : null}
        </div>
      )
    },
    {
      accessorKey: "category",
      header: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              Category
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onCategoryFilterChange("all")}>
              <span className="flex min-w-32 items-center justify-between gap-3">
                All categories
                {categoryFilter === "all" ? <Check className="h-4 w-4" /> : null}
              </span>
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem key={category} onClick={() => onCategoryFilterChange(category)}>
                <span className="flex min-w-32 items-center justify-between gap-3">
                  {category}
                  {categoryFilter === category ? <Check className="h-4 w-4" /> : null}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const item = row.original;
        const isLow = item.quantity <= item.lowStockAt;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label={`Decrease ${item.name}`}
              onClick={() => onQuantityChange(item, Math.max(0, item.quantity - 1))}
            >
              -
            </Button>
            <span className="w-16 text-center text-sm">
              {item.quantity} {item.unit}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Increase ${item.name}`}
              onClick={() => onQuantityChange(item, item.quantity + 1)}
            >
              +
            </Button>
            {isLow ? <Badge variant="destructive">Low</Badge> : null}
          </div>
        );
      }
    },
    {
      accessorKey: "unitCost",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Unit cost
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.original.unitCost)
    },
    {
      accessorKey: "totalCost",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.totalCost)}</span>
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.original.location ?? "-"
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${row.original.name}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // TanStack Table intentionally returns function-bearing table objects.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No items found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
