import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { Button } from "../ui/button";
import { CircleUser, Menu } from "lucide-react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";

const routes = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
  },
  {
    name: "Products",
    href: "/dashboard/products",
  },
];

export default function DashboardNav() {
  const router = useRouter();
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-white-W50 px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <div className="h-6 w-6">
            <Image src="/favicon.ico" alt="Value app" width="24" height="24" />
          </div>

          <span className="sr-only">Value app</span>
        </Link>
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              router.pathname === route.href
                ? "text-black-B500"
                : "text-gray-500",
              "transition-colors hover:text-black-B500",
            )}
          >
            {route.name}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Image
                src="/favicon.ico"
                alt="Value app"
                width="24"
                height="24"
              />
              <span className="sr-only">Value app</span>
            </Link>
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  router.pathname === route.href
                    ? "text-black-B500"
                    : "text-gray-500",
                  "transition-colors hover:text-black-B500",
                )}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
