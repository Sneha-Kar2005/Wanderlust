import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoginPanel } from "@/components/auth/LoginPanel";

export const metadata: Metadata = { title: "Log in or sign up - Airbnb" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const mode = (Array.isArray(sp.mode) ? sp.mode[0] : sp.mode) === "signup"
    ? "signup"
    : "login";

  return (
    <>
      <Header variant="compact" />
      <main className="flex flex-1 items-start justify-center px-6 py-12">
        <LoginPanel initialMode={mode} />
      </main>
      <Footer />
    </>
  );
}
