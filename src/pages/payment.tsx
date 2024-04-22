import { useRouter } from "next/router";
import { useEffect } from "react";

// this is just to make the typescript happy :)
declare const Moyasar: {
  init: (config: {
    element: string;
    amount: string;
    currency: string;
    description: string;
    publishable_api_key: string;
    callback_url: string;
    metadata: { orderId: string };
    on_completed: string;
    methods: string[];
  }) => void;
};

export default function Payment() {
  const router = useRouter();

  const { orderId, amount } = router.query;

  useEffect(() => {
    if (typeof orderId !== "string" || typeof amount !== "string") {
      return;
    }

    Moyasar.init({
      element: ".mysr-form",
      // Amount in the smallest currency unit.
      // For example:
      // 10 SAR = 10 * 100 Halalas
      // 10 KWD = 10 * 1000 Fils
      // 10 JPY = 10 JPY (Japanese Yen does not have fractions)
      amount: amount,
      currency: "SAR",
      description: "Payment for order " + orderId,
      publishable_api_key: "pk_test_kHAGrPeKHrLNE1tdQdo3ZPWVTVHZ2c5kDSjYynj5",
      callback_url: "https://value-omega.vercel.app/api/payment/callback",
      metadata: {
        orderId: orderId,
      },
      on_completed: "https://value-omega.vercel.app/api/payment/save",
      methods: ["creditcard"],
    });
  }, [orderId, amount]);

  if (typeof orderId !== "string" || typeof amount !== "string") {
    return <p>Invalid payment request</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FAFBFC] px-4 pt-12 font-montserrat">
      <div className="mysr-form"></div>
    </main>
  );
}
