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
import { ArrowUpDown, MoreHorizontal, Eye, Copy, Check, Shield, ShieldOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { GrantAdminDialog } from "./GrantAdminDialog";
import { RevokeAdminDialog } from "./RevokeAdminDialog";
import { useAuth } from "@/components/auth/AuthProvider";

interface UsersTableProps {
  users: UserDocument[];
  onRefresh?: () => void;
}

export function UsersTable({ users, onRefresh }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [grantAdminDialogOpen, setGrantAdminDialogOpen] = useState(false);
  const [revokeAdminDialogOpen, setRevokeAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDocument | null>(null);
  const router = useRouter();
  const { user: currentAdmin } = useAuth();

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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{row.getValue("email")}</span>
              {row.original.isAdmin && (
                <Badge variant="destructive" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  {row.original.role === "super_admin"
                    ? "Super Admin"
                    : row.original.role === "admin"
                    ? "Admin"
                    : "Moderator"}
                </Badge>
              )}
            </div>
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
          const isCopied = copiedUid === user.uid;

          const handleCopyUid = () => {
            navigator.clipboard.writeText(user.uid);
            setCopiedUid(user.uid);
            toast.success("UID kopyalandı");
            setTimeout(() => setCopiedUid(null), 2000);
          };

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
                <DropdownMenuItem onClick={handleCopyUid}>
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      UID Kopyala
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/users/${user.uid}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Detayları Görüntüle
                </DropdownMenuItem>
                {currentAdmin && currentAdmin.uid !== user.uid && (
                  <>
                    <DropdownMenuSeparator />
                    {user.isAdmin ? (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setRevokeAdminDialogOpen(true);
                        }}
                        className="text-orange-600"
                      >
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Admin Yetkisini Kaldır
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setGrantAdminDialogOpen(true);
                        }}
                        className="text-green-600"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Yetkisi Ver
                      </DropdownMenuItem>
                    )}
                  </>
                )}
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
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
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
                    <TableCell key={cell.id} className="whitespace-nowrap">
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

      {/* Admin Management Dialogs */}
      <GrantAdminDialog
        user={selectedUser}
        open={grantAdminDialogOpen}
        onOpenChange={setGrantAdminDialogOpen}
        onSuccess={() => {
          if (onRefresh) {
            onRefresh();
          }
          setSelectedUser(null);
        }}
      />
      
      <RevokeAdminDialog
        user={selectedUser}
        open={revokeAdminDialogOpen}
        onOpenChange={setRevokeAdminDialogOpen}
        onSuccess={() => {
          if (onRefresh) {
            onRefresh();
          }
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
