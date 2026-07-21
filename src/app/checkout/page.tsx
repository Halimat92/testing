import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout | Leemah Cakes N More",
  description: "Complete your Leemah Cakes N More order.",
};

export default function CheckoutPage() {
  return (
    <>
      <Nav />

      <main className="flex-1">
        <section className="mx-auto max-w-[1000px] px-6 py-16 md:py-20">
          <h1 className="text-4xl">Checkout</h1>
          <div className="mt-10">
            <CheckoutForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
