import DashboardNav from "@/components/dashboard/DashboardNav";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/utils/api";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Products() {
  const products = api.store.products.useQuery();
  const updateProductStatus = api.store.setProductStatus.useMutation({
    onSuccess: () => {
      void products.refetch();
    },
  });
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col sm:gap-4">
      <DashboardNav />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="flex items-center">
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={() => {
                void router.push("/dashboard/products/new");
              }}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Product
              </span>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Categories
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Total Sales
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.data?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Product image"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={
                          product.images[0]?.url ??
                          "https://via.placeholder.com/64"
                        }
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.status === "HIDDEN" ? "Draft" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.Subcategory.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Intl.NumberFormat("ar", {
                        style: "currency",
                        currency: "SAR",
                      }).format(product.price)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.productOrder.reduce(
                        (acc, curr) => acc + curr.quantity,
                        0,
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              void router.push(
                                `/dashboard/products/${product.id}/edit`,
                              );
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (updateProductStatus.isLoading) return;
                              updateProductStatus.mutate({
                                id: product.id,
                                status:
                                  product.status === "HIDDEN"
                                    ? "VISIBLE"
                                    : "HIDDEN",
                              });
                            }}
                          >
                            {product.status === "HIDDEN" ? "Show" : "Hide"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  const session = useSession();
  const router = useRouter();

  if (session.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-slate-900 dark:border-slate-50"></div>
      </div>
    );
  }
  if (session.status === "unauthenticated") {
    void router.push("/");
    return null;
  }

  if (session.data?.user.userType !== "SELLER") {
    void router.push("/");
    return null;
  }

  return <Products />;
}
