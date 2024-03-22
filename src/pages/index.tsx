import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { api } from "~/utils/api";
import "bootstrap/dist/css/bootstrap.min.css";

// Make sure the import path for onboarding is correct
import onboarding from "../pages/Onboarding1/onboarding";
import Onboarding from "../pages/Onboarding2/onboarding2";
import ProductCard from "~/components/productcard/productcard";

import Category from "~/components/Category/Category";
import Navbar from "~/components/Navbar/Navbar";
import HeadBtn from "~/components/Head-btn/HeadBtn";
import { useState } from "react";
import { AddressLocator } from "~/components/address-locator";
export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  // to test uncomment this :
  // const { data: categoriesData, isLoading, isError } = api.categories.getByType.useQuery( { categoryType: 'FARM' });

  return (
    <main className="container font-montserrat">
      <ProductCard />

      <Navbar />
      <HeadBtn />
      <Category />

      <div className="flex flex-col items-center gap-2">
        <AuthShowcase />

        {/*FOR!!! TEST UNCOMMENT THIS  */}

        {/* {isLoading && <p>Loading categories...</p>}
        {isError && <p>Failed to load categories.</p>}
        {categoriesData && (
          <ul>
            {categoriesData.map((category) => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul> */}
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
  const [isAddressModelOpen, setIsAddressModelOpen] = useState(false);

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
      <h3
        className="cursor-pointer"
        onClick={() => {
          setIsAddressModelOpen(true);
        }}
      >
        address Map
      </h3>

      <button
        className="btn btn-primary"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
      <AddressLocator
        isOpen={isAddressModelOpen}
        onClose={() => {
          setIsAddressModelOpen(false);
        }}
        onSaveAddress={(address, langLat) => {
          console.log(address, langLat);
        }}
      />
    </div>
  );
}
