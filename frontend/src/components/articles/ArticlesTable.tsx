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
  FileText,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Article, ArticleType } from "@/lib/types";

type ArticleStatus = "RAW_MATERIAL" | "FINISHED";

interface ArticlesTableProps {
  articles: Article[];
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
  RAW_MATERIAL: "Matière première",
  FINISHED: "Produit fini",
};

export function ArticlesTable({ 
  articles = [], 
  onEdit, 
  onDelete, 
  onView,
}: ArticlesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        accessorFn: (row) => row.code_bare || row.code || "-",
        id: "code_bare",
        header: "Code",
        cell: (info) => <div className="font-medium">{info.getValue() as string}</div>,
      },
      {
        accessorFn: (row) => row.name || "-",
        id: "name",
        header: "Name",
      },
      {
        accessorFn: (row) => row.articleDescription || "-",
        id: "description",
        header: "Description",
      },
      {
        accessorFn: (row) => {
          if (row.isArticleAchte) return "raw";
          if (row.isArticleFabrique) return "component";
          return "finished";
        },
        id: "type",
        header: "Type",
        cell: (info) => {
          const type = info.getValue() as ArticleType;
          return (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              <span>{typeLabels[type] || type}</span>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.unit || "-",
        id: "unit",
        header: "Unité",
      },
      {
        accessorFn: (row) => row.safetyStock || row.stockSecurity || 0,
        id: "safetyStock",
        header: "Stock sécu.",
        cell: (info) => <div className="text-right">{info.getValue() as number}</div>,
      },
      {
        accessorFn: (row) => row.delaidoptention || row.leadTime || 0,
        id: "delaidoptention",
        header: "Délai (j)",
        cell: (info) => <div className="text-right">{info.getValue() as number}</div>,
      },
      {
        accessorFn: (row) => row.lotSize || 0,
        id: "lotSize",
        header: "Lot",
        cell: (info) => {
          const value = info.getValue() as number;
          return <div className="text-right">{value > 0 ? value : "-"}</div>;
        },
      },
      {
        accessorFn: (row) => row.unitPrice || row.price || 0,
        id: "unitPrice",
        header: "Prix",
        cell: (info) => <div className="text-right">{(info.getValue() as number).toFixed(2)} €</div>,
      },
      {
        accessorKey: "TVA",
        header: "TVA",
        cell: (info) => {
          const value = info.getValue() as number | undefined;
          return <div className="text-right">{value ? `${value}%` : "-"}</div>;
        },
      },
      {
        accessorFn: (row) => row.Fournisseur || row.supplier || "-",
        id: "fournisseur",
        header: "Fournisseur",
      },
      {
        accessorKey: "isArticleFabrique",
        header: "Fabriqué",
        cell: (info) => {
          const value = info.getValue() as boolean;
          return value ? "Oui" : "Non";
        },
      },
      {
        accessorKey: "isArticleAchte",
        header: "Acheté",
        cell: (info) => {
          const value = info.getValue() as boolean;
          return value ? "Oui" : "Non";
        },
      },
      {
        accessorFn: (row) => row.status || "RAW_MATERIAL",
        id: "status",
        header: "Statut",
        cell: (info) => {
          const status = info.getValue() as ArticleStatus;
          
          const statusClasses = {
            RAW_MATERIAL: "bg-blue-100 text-blue-800",
            FINISHED: "bg-green-100 text-green-800",
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
    data: articles,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}