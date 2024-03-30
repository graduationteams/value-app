import Link from "next/link";
import {
  ArrowUpRight,
  DollarSign,
  ShoppingBasket,
  CircleDollarSign,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import DashboardNav from "@/components/dashboard/DashboardNav";

function OrdersOverview() {
  const counts = api.store.OrdersCount.useQuery();

  if (counts.status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-slate-900 dark:border-slate-50"></div>
      </div>
    );
  }

  if (counts.status === "error") {
    return <div>Error: {counts.error.message}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={counts.data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const months = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];

            return months[Number(value)] ?? "";
          }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="count"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Dashboard() {
  const dashboardData = api.store.dashboard.useQuery();

  const top5Products = api.store.top5Products.useQuery();

  if (dashboardData.status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-slate-900 dark:border-slate-50"></div>
      </div>
    );
  }

  if (dashboardData.status === "error") {
    return <div>Error: {dashboardData.error.message}</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardNav />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" dir="ltr">
                {new Intl.NumberFormat("ar", {
                  style: "currency",
                  currency: "sar",
                  currencyDisplay: "symbol",
                }).format(dashboardData.data.totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingBasket className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.data.totalOrders}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <CircleDollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("ar", {
                  style: "currency",
                  currency: "sar",
                  currencyDisplay: "symbol",
                }).format(dashboardData.data.monthlyRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.data.monthlyOrders}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Monthly orders</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
              <OrdersOverview />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Products</CardTitle>
                <CardDescription>Top selling products</CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/products">
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity Sold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top5Products.data
                    ? top5Products.data.map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell>
                            <div className="font-medium">
                              {product.product_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(product.total_quantity_sold)}
                          </TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
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

  return <Dashboard />;
}
