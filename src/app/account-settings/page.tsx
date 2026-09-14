import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/session";
import { ChevronRightIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Account - Airbnb" };

const SETTINGS = [
  { title: "Personal info", body: "Provide personal details and how we can reach you" },
  { title: "Login & security", body: "Update your password and secure your account" },
  { title: "Payments & payouts", body: "Review payments, payouts, coupons and gift cards" },
  { title: "Taxes", body: "Manage taxpayer information and tax documents" },
  { title: "Notifications", body: "Choose notification preferences and how you want to be contacted" },
  { title: "Privacy & sharing", body: "Manage your personal data, connected services and data sharing settings" },
  { title: "Global preferences", body: "Set your default language, currency and timezone" },
  { title: "Travel for work", body: "Add a work email for business trip benefits" },
];

export default async function AccountSettingsPage() {
  const user = await getCurrentUser();

  return (
    <>
      <Header variant="compact" />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 pb-16">
        <h1 className="pt-8 text-[32px] font-semibold leading-9 text-[#222]">Account</h1>
        <p className="mb-8 mt-2 text-[16px] leading-5 text-[#222]">
          <span className="font-medium">
            {user.firstName} {user.lastName}
          </span>
          , {user.email} ·{" "}
          <Link
            href={`/users/show/${user.id}`}
            className="font-medium underline underline-offset-2"
          >
            Go to profile
          </Link>
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SETTINGS.map((s) => (
            <Link
              key={s.title}
              href="/account-settings"
              className="rounded-xl border border-[#dddddd] p-6 transition hover:shadow-[var(--shadow-elevation-2)]"
            >
              <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f7f7] text-[#222]">
                <ChevronRightIcon size={12} />
              </span>
              <span className="block text-[16px] font-medium leading-5 text-[#222]">
                {s.title}
              </span>
              <span className="mt-1 block text-[14px] leading-[18px] text-[#6a6a6a]">
                {s.body}
              </span>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
