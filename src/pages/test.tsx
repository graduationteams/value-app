"use client";

import { useState } from "react";
import { MyDrawer } from "../components/Bottomsheet/bottomsheet";

export default function Test() {
  const [isAddressopen, setIsAddressOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
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
          <div className="Signint w-[393px] h-[400px] relative bg-gray-50 rounded-tl-xl rounded-tr-xl">
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
