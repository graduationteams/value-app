import React from "react";
import { Basket } from "../icons/basket";
import { Cube } from "../icons/orders";
import { Account } from "../icons/account";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Logo } from "../icons/logo";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";

const Navbar = () => {
  const router = useRouter();
  const isActive = (href: string) => router.pathname === href;
  const session = useSession();

  const cart = api.cart.get.useQuery(undefined, {
    enabled: session.status === "authenticated",
  });

  const count = cart.data?.products.reduce(
    (acc, product) => acc + product.quantity,
    0,
  );

  if (
    !["/", "/cart", "/orders", "/Account", "/driver"].includes(
      router.pathname,
    ) &&
    !router.pathname.startsWith("/orders/")
  )
    return null;
  return (
    <div className="fixed bottom-0 h-16 w-full bg-[#FFFFFF] px-4 font-montserrat">
      <nav
        className={cn(
          "grid grid-cols-4 gap-4 py-2",
          (session.data?.user.userType === "SELLER" ||
            session.data?.user.userType === "DRIVER") &&
            "grid-cols-5",
        )}
      >
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
          href="/cart"
          className={cn(
            "flex flex-col items-center justify-between text-black-B75 no-underline",
            {
              "text-primary-P300": isActive("/cart"),
            },
          )}
        >
          {count && count > 0 ? (
            <span className="absolute -mt-2 ml-6 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-small text-white-W50">
              {count}
            </span>
          ) : null}
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
        {session.data?.user.userType === "SELLER" && (
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-between text-black-B75 no-underline",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.54 15h6.42l.5 1.5H8.29l.5-1.5Zm8.085-8.995a.75.75 0 1 0-.75-1.299 12.81 12.81 0 0 0-3.558 3.05L11.03 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 0 0 1.146-.102 11.312 11.312 0 0 1 3.612-3.321Z"
                clipRule="evenodd"
              />
            </svg>

            <span className="text-xs">Dashboard</span>
          </Link>
        )}
        {session.data?.user.userType === "DRIVER" && (
          <Link
            href="/driver"
            className={cn(
              "flex flex-col items-center justify-between text-black-B75 no-underline",
              {
                "text-primary-P300": isActive("/driver"),
              },
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 1 1 6 0h3a.75.75 0 0 0 .75-.75V15Z" />
              <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0ZM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75Z" />
              <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
            </svg>
            <span className="text-xs">Driver</span>
          </Link>
        )}
      </nav>
      <br />
    </div>
  );
};

export default Navbar;
