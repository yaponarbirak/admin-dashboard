"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  getSortedRowModel,
  type SortingState,
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
import { Badge } from "@/components/ui/badge";
import type { UserDocument } from "@/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UsersTableProps {
  users: UserDocument[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();

  const columns = useMemo<ColumnDef<UserDocument>[]>(
    () => [
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              E-posta
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("email")}</span>
            {row.original.fullName && (
              <span className="text-sm text-muted-foreground">
                {row.original.fullName}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "profileType",
        header: "Tip",
        cell: ({ row }) => {
          const type = row.getValue("profileType") as string;
          const typeMap = {
            customer: { label: "Müşteri", variant: "secondary" as const },
            serviceProvider: {
              label: "Hizmet Sağlayıcı",
              variant: "default" as const,
            },
          };

          const typeData =
            typeMap[type as keyof typeof typeMap] || typeMap.customer;

          return <Badge variant={typeData.variant}>{typeData.label}</Badge>;
        },
      },
      {
        accessorKey: "isActive",
        header: "Durum",
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          const isBanned = row.original.isBanned;

          if (isBanned) {
            return <Badge variant="destructive">Yasaklı</Badge>;
          }

          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Aktif" : "Pasif"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Kayıt Tarihi
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const timestamp = row.getValue("createdAt") as any;
          const date = timestamp?.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
          return (
            <span className="text-sm">
              {format(date, "d MMM yyyy", { locale: tr })}
            </span>
          );
        },
      },
      {
        accessorKey: "lastLoginAt",
        header: "Son Giriş",
        cell: ({ row }) => {
          const timestamp = row.getValue("lastLoginAt") as any;
          if (!timestamp)
            return <span className="text-sm text-muted-foreground">—</span>;

          const date = timestamp?.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
          return (
            <span className="text-sm text-muted-foreground">
              {format(date, "d MMM yyyy HH:mm", { locale: tr })}
            </span>
          );
        },
      },
      {
        accessorKey: "jobsPosted",
        header: "İlanlar",
        cell: ({ row }) => {
          const jobsPosted = (row.getValue("jobsPosted") as number) || 0;
          const jobsCompleted = row.original.jobsCompleted || 0;
          return (
            <div className="flex flex-col text-sm">
              <span>{jobsPosted} İlan</span>
              <span className="text-muted-foreground">
                {jobsCompleted} Tamamlandı
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Menüyü aç</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(user.uid)}
                >
                  UID Kopyala
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/users/${user.uid}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Detayları Görüntüle
                </DropdownMenuItem>
                <DropdownMenuItem>Düzenle</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Kullanıcıyı Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-lg border bg-card">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Kullanıcı bulunamadı.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
