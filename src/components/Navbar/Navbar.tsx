import React from "react";
import { Basket } from "../icons/basket";
import { Cube } from "../icons/orders";
import { Account } from "../icons/account";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Logo } from "../icons/logo";

const Navbar = () => {
  const router = useRouter();
  const isActive = (href: string) => router.pathname === href;

  return (
    <div className="fixed bottom-0 h-16 w-full bg-[#FFFFFF] px-4">
      <nav className="grid grid-cols-4 gap-4 py-2">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-between text-black-B75 no-underline",
            {
              "text-primary-P300": isActive("/"),
            },
          )}
        >
          <Logo />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          href="/basket"
          className={cn(
            "flex flex-col items-center justify-between text-black-B75 no-underline",
            {
              "text-primary-P300": isActive("/basket"),
            },
          )}
        >
          <Basket />
          <span className="text-xs">Basket</span>
        </Link>
        <Link
          href="/orders"
          className={cn(
            "flex flex-col items-center justify-between text-black-B75 no-underline",
            {
              "text-primary-P300": isActive("/orders"),
            },
          )}
        >
          <Cube />
          <span className="text-xs">Orders</span>
        </Link>
        <Link
          href="/Account"
          className={cn(
            "flex flex-col items-center justify-between text-black-B75 no-underline",
            {
              "text-primary-P300": isActive("/Account"),
            },
          )}
        >
          <Account />
          <span className="text-xs">Account</span>
        </Link>
      </nav>
      <br />
    </div>
  );
};

export default Navbar;
