"use client";

import { useState } from "react";
import { MyDrawer } from "../components/Bottomsheet/bottomsheet";
import { api } from "@/utils/api";

export default function Test() {
  const [isAddressopen, setIsAddressOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const cart = api.cart.add.useMutation();

  return (
    <div>
      <button
        onClick={() => {
          cart.mutate({ productId: "cluxci6vx00ayos28iruulsff" });
          return;
          setIsMapOpen(true);
          setIsAddressOpen(false); // Close the first drawer
        }}
      >
        Open Map
      </button>
      <br />
      <button
        onClick={() => {
          setIsAddressOpen(true);
          setIsMapOpen(false); // Close the second drawer
        }}
      >
        Open Address
      </button>
      <br />

      <MyDrawer
        isOpen={isAddressopen}
        onclose={() => {
          setIsAddressOpen(false);
        }}
      >
        <div className="text-red-600">
          <h1>Address</h1>
          <div className="Signint relative h-[400px] w-[393px] rounded-tl-xl rounded-tr-xl bg-gray-50">
            <button
              onClick={() => {
                setIsMapOpen(true); // Open the second drawer
                setIsAddressOpen(false); // Close the first drawer
              }}
            >
              Open Map
            </button>
            {/* Content of the drawer */}
          </div>
        </div>
      </MyDrawer>

      <MyDrawer
        isOpen={isMapOpen}
        onclose={() => {
          setIsMapOpen(false);
        }}
      >
        <div className="text-red-600">
          <h1>Map</h1>
          <p>This is the content of the drawer2</p>
        </div>
      </MyDrawer>
    </div>
  );
}
