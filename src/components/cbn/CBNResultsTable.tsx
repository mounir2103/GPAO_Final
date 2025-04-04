
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { CBNPeriod, Article } from "@/lib/types";

interface CBNResultRow extends CBNPeriod {
  period: string;
}

interface CBNResultsTableProps {
  data: CBNResultRow[];
  article: Article;
}

export function CBNResultsTable({ data, article }: CBNResultsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<CBNResultRow>[]>(
    () => [
      {
        accessorKey: "period",
        header: "Période",
        cell: (info) => <div className="font-medium">{info.getValue() as string}</div>,
      },
      {
        accessorKey: "grossRequirements",
        header: "Besoins bruts",
        cell: (info) => <div className="text-right">{info.getValue() as number}</div>,
      },
      {
        accessorKey: "scheduledReceipts",
        header: "Réceptions programmées",
        cell: (info) => <div className="text-right">{info.getValue() as number}</div>,
      },
      {
        accessorKey: "projectedInventory",
        header: "Stock prévisionnel",
        cell: (info) => {
          const value = info.getValue() as number;
          const isBelowSafety = value < article.stockSecurity;
          
          return (
            <div className={`text-right ${isBelowSafety ? "text-orange-500 font-medium" : ""}`}>
              {value}
            </div>
          );
        },
      },
      {
        accessorKey: "netRequirements",
        header: "Besoins nets",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <div className={`text-right ${value > 0 ? "text-destructive font-medium" : ""}`}>
              {value > 0 ? value : 0}
            </div>
          );
        },
      },
      {
        accessorKey: "plannedOrders",
        header: "Ordres planifiés",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <div className={`text-right ${value > 0 ? "text-blue-500 font-medium" : ""}`}>
              {value > 0 ? value : 0}
            </div>
          );
        },
      },
      {
        accessorKey: "plannedOrderReleases",
        header: "Lancements",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <div className={`text-right ${value > 0 ? "text-green-500 font-medium" : ""}`}>
              {value > 0 ? value : 0}
            </div>
          );
        },
      },
    ],
    [article.stockSecurity]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Rechercher..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Lignes par page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-16 rounded-md border border-input bg-transparent"
            >
              {[5, 8, 10, 15, 20].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-md border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort() ? "cursor-pointer select-none" : undefined
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun résultat
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
