"use client";

import { useState } from "react";
import { MyDrawer } from "../components/Bottomsheet/bottomsheet";

export default function Test() {
  const [isAddressopen, setIsadressOpen] = useState(false);
  const [isMapOpen, setIsmapOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setIsmapOpen(true);
        }}
      >
        map
      </button>
      <br />
      <button
        onClick={() => {
          setIsadressOpen(true);
        }}
      >
        address
      </button>
      <br />
     
      <MyDrawer
        isOpen={isAddressopen}
        onclose={() => {
          setIsadressOpen(false);
        }}
      >
        <div className="text-red-600">
          <h1>address</h1>
          <div className="Signint w-[393px] h-[400px] relative bg-gray-50 rounded-tl-xl rounded-tr-xl">
            {/* Content of the drawer */}
          </div>
        </div>
      </MyDrawer>

      <MyDrawer
        isOpen={isMapOpen}
        onclose={() => {
          setIsmapOpen(false);
        }}
      >
        <div className="text-red-600">
          <h1>map</h1>
          <p>This is the content of the drawer2</p>
        </div>
      </MyDrawer>
    </div>
  );
}
