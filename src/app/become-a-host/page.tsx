import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HostWizard } from "@/components/host/HostWizard";

export const metadata: Metadata = { title: "Airbnb your home - Airbnb" };

export default function BecomeAHostPage() {
  return (
    <>
      <Header variant="compact" />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 pb-16">
        <HostWizard />
      </main>
      <Footer />
    </>
  );
}
