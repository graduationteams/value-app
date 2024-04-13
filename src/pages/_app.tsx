import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Navbar from "@/components/Navbar/Navbar";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [appPage] = useAutoAnimate();
  return (
    <SessionProvider session={session}>
      <div ref={appPage}>
        <Component {...pageProps} />
      </div>
      <Navbar />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
