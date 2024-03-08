import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { api } from "~/utils/api";
import "bootstrap/dist/css/bootstrap.min.css";
import Category from "~/components/Category/Category";
import Navbar from "~/components/Navbar/Navbar";
import HeadBtn from "~/components/Head-btn/HeadBtn";
export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  return (
    <main className="font-montserrat container">
      {" "}

      
      
      <Navbar/>
      <HeadBtn/>
      <Category/>
    
      <div className="flex flex-col items-center gap-2">
        <AuthShowcase />
      </div>
      <br />
      <br />
      <br />
    </main>
  );
}

/*<div className="Hbut">
<HomeButtons />
</div> */

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Using the custom-defined h2 size and bold weight from Tailwind config */}
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
