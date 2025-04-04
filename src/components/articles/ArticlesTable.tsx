
import React, { useMemo } from "react";
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
  Edit,
  Trash,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Article, ArticleStatus, ArticleType } from "@/lib/types";

interface ArticlesTableProps {
  data: Article[];
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onView: (article: Article) => void;
}

type ArticleTypeLabel = {
  [key in ArticleType]: string;
};

type ArticleStatusLabel = {
  [key in ArticleStatus]: string;
};

const typeLabels: ArticleTypeLabel = {
  raw: "Matière première",
  component: "Composant",
  finished: "Produit fini",
};

const statusLabels: ArticleStatusLabel = {
  active: "Actif",
  inactive: "Inactif",
  discontinued: "Abandonné",
  pending: "En attente",
};

export function ArticlesTable({ data, onEdit, onDelete, onView }: ArticlesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: (info) => <div className="font-medium">{info.getValue() as string}</div>,
      },
      {
        accessorKey: "name",
        header: "Nom",
      },
      {
        accessorKey: "articleDescription",
        header: "Description",
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return value || "-";
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => {
          const type = info.getValue() as ArticleType;
          return typeLabels[type] || type;
        },
      },
      {
        accessorKey: "unit",
        header: "Unité",
      },
      {
        accessorKey: "stockSecurity",
        header: "Stock sécu.",
        cell: (info) => <div className="text-right">{info.getValue() as number}</div>,
      },
      {
        accessorKey: "leadTime",
        header: "Délai (j)",
        cell: (info) => <div className="text-right">{info.getValue() as number}</div>,
      },
      {
        accessorKey: "price",
        header: "Prix",
        cell: (info) => <div className="text-right">{(info.getValue() as number).toFixed(2)} €</div>,
      },
      {
        accessorKey: "fournisseur",
        header: "Fournisseur",
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return value || "-";
        },
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: (info) => {
          const status = info.getValue() as ArticleStatus | undefined;
          if (!status) return "-";
          
          const statusClasses = {
            active: "bg-green-100 text-green-800",
            inactive: "bg-gray-100 text-gray-800",
            discontinued: "bg-red-100 text-red-800",
            pending: "bg-yellow-100 text-yellow-800",
          };
          
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
              {statusLabels[status]}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex justify-center space-x-1">
              <Button variant="ghost" size="icon" onClick={() => onView(row.original)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(row.original)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete, onView]
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
        pageSize: 10,
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
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-md border shadow-sm">
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
                  Aucun article trouvé
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
