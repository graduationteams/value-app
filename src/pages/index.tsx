import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { api } from "~/utils/api";
import "bootstrap/dist/css/bootstrap.min.css";
import SearchBar from "~/components/searchBar/SearchBar";
import HomeButtons from "~/components/home-buttons/HomeButtons"
import onboarding from "./Onboarding1/onboarding"

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <div className="container">
      <div className="flex flex-col items-center gap-2">
        <AuthShowcase />
      </div>
      <div className="Hbut">
        <HomeButtons/>
        </div>
      
    </div>
  );
}

function AuthShowcase() {
  
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="h5 text-center text-2xl">
        {sessionData && <span>Hala! {sessionData.user?.name} </span>}

        <Image
          src="/images/icons/hand-icon.png"
          alt="hand icon"
          className="hand"
          width={30}
          height={10}
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


