import type { Metadata } from "next";
import "./globals.css";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "Airbnb | Holiday rentals, cabins, beach houses & more",
  description:
    "Find holiday rentals, cabins, beach houses, unique homes and experiences around the world - all made possible by hosts on Airbnb.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className="h-full">
      <body className="flex min-h-full flex-col bg-white pb-14 text-[#222] antialiased md:pb-0">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
