import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header variant="compact" />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[14px] font-medium uppercase tracking-wide text-[#6a6a6a]">
          Error 404
        </p>
        <h1 className="mt-4 text-[32px] font-semibold leading-9 text-[#222]">
          We can&apos;t seem to find the page you&apos;re looking for.
        </h1>
        <p className="mt-4 text-[16px] leading-6 text-[#6a6a6a]">
          Here are some helpful links instead:
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-[#222] px-6 py-3.5 text-[16px] font-medium leading-5 text-white transition hover:bg-black"
          >
            Home
          </Link>
          <Link
            href="/help"
            className="rounded-lg border border-[#222] px-6 py-3.5 text-[16px] font-medium leading-5 text-[#222] transition hover:bg-[#f7f7f7]"
          >
            Help Centre
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
