import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { api } from "~/utils/api";
import "bootstrap/dist/css/bootstrap.min.css";
import SearchBar from "~/components/searchBar/SearchBar";
import HomeButtons from "~/components/home-buttons/HomeButtons";
// Make sure the import path for onboarding is correct
import onboarding from "./Onboarding1/onboarding";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <main className="container font-montserrat"> {/* Applying Montserrat-Arabic font */}
      <div className="flex flex-col items-center gap-2">
        <AuthShowcase />
      </div>
      <div className="Hbut">
        <HomeButtons />
      </div>
    </main>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Using the custom-defined h2 size and bold weight from Tailwind config */}
      <p className="text-h2 font-bold">
        {sessionData && <span>Hala! {sessionData.user?.name} </span>}

        <Image
          src="/images/icons/hand-icon.png"
          alt="hand icon"
          width={30}
          height={30} // Adjusted for consistency
        />
      </p>

      <button
        className="btn btn-primary"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}



