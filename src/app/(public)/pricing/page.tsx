import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { PricingClient } from "./PricingClient";

export const metadata: Metadata = { title: "Үнэ — EduNity" };

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F7F4FF]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10 pb-20">
        <PricingClient />
      </div>
    </div>
  );
}
