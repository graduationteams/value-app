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

function Orders() {
  const lastSales = api.store.lastSales.useQuery();
  const orders = api.store.orders.useQuery();

  return (
    <div className="flex min-h-screen w-full flex-col sm:gap-4">
      <DashboardNav />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-6">
                {lastSales.data ? (
                  <>
                    <CardDescription>This Week</CardDescription>
                    <CardTitle className="text-2xl">
                      {new Intl.NumberFormat("ar", {
                        style: "currency",
                        currency: "sar",
                        currencyDisplay: "symbol",
                      }).format(lastSales.data.lastWeekSales)}
                    </CardTitle>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-slate-900 dark:border-slate-50"></div>
                  </div>
                )}
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-6">
                {lastSales.data ? (
                  <>
                    <CardDescription>This Month</CardDescription>
                    <CardTitle className="text-2xl">
                      {new Intl.NumberFormat("ar", {
                        style: "currency",
                        currency: "sar",
                        currencyDisplay: "symbol",
                      }).format(lastSales.data.lastMonthSales)}
                    </CardTitle>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-slate-900 dark:border-slate-50"></div>
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>
          <Card>
            <CardHeader className="px-7">
              <CardTitle>Orders</CardTitle>
              <CardDescription>Recent orders from your store.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.data?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="hidden text-sm text-gray-500 md:inline">
                          {order.user.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          className="text-xs"
                          variant={
                            order.status === "CANCELLED"
                              ? "destructive"
                              : order.status === "DELIVERED"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("ar", {
                          style: "currency",
                          currency: "sar",
                          currencyDisplay: "symbol",
                        }).format(
                          order.productOrder.reduce((acc, curr) => {
                            return acc + curr.price * curr.quantity;
                          }, 0),
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function OrdersPage() {
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

  return <Orders />;
}
