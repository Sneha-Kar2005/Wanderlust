"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FacebookIcon, XSocialIcon, GlobeIcon } from "@/components/ui/icons";

export interface LoginPanelProps {
  initialMode?: "login" | "signup";
}

/** Phone-first auth, matching Airbnb India's default. */
export function LoginPanel({ initialMode = "login" }: LoginPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [useEmail, setUseEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (useEmail) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setError("Enter a valid email address.");
        return;
      }
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setError(null);
    router.push("/");
  }

  return (
    <div className="w-full max-w-[568px] overflow-hidden rounded-xl border border-[#dddddd] bg-white">
      <header className="flex h-16 items-center justify-center border-b border-[#ebebeb]">
        <h1 className="text-[16px] font-semibold leading-5 text-[#222]">
          Log in or sign up
        </h1>
      </header>

      <div className="p-6">
        <h2 className="mb-6 text-[22px] font-medium leading-[26px] text-[#222]">
          Welcome to Airbnb
        </h2>

        <form onSubmit={submit}>
          {useEmail ? (
            <label className="block rounded-lg border border-[#b0b0b0] px-3 py-2">
              <span className="block text-[12px] leading-4 text-[#6a6a6a]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-[16px] leading-5 text-[#222] outline-none"
              />
            </label>
          ) : (
            <div className="rounded-lg border border-[#b0b0b0]">
              <div className="flex items-center justify-between border-b border-[#b0b0b0] px-3 py-2">
                <span>
                  <span className="block text-[12px] leading-4 text-[#6a6a6a]">
                    Country/Region
                  </span>
                  <span className="block text-[16px] leading-5 text-[#222]">
                    India (+91)
                  </span>
                </span>
                <GlobeIcon size={16} />
              </div>
              <label className="block px-3 py-2">
                <span className="block text-[12px] leading-4 text-[#6a6a6a]">
                  Phone number
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full bg-transparent text-[16px] leading-5 text-[#222] outline-none"
                />
              </label>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-2 text-[12px] leading-4 text-arches">
              {error}
            </p>
          )}

          <p className="mt-3 text-[12px] leading-4 text-[#6a6a6a]">
            We&apos;ll call or text you to confirm your number. Standard message and data
            rates apply.
          </p>

          <button
            type="submit"
            className="mt-4 h-12 w-full rounded-lg bg-rausch-gradient text-[16px] font-medium leading-5 text-white transition hover:brightness-95"
          >
            Continue
          </button>
        </form>

        <div className="my-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-[#dddddd]" />
          <span className="text-[12px] leading-4 text-[#222]">or</span>
          <span className="h-px flex-1 bg-[#dddddd]" />
        </div>

        <div className="space-y-3">
          <SocialButton
            onClick={() => setUseEmail((v) => !v)}
            label={useEmail ? "Continue with phone" : "Continue with email"}
            icon={<GlobeIcon size={18} />}
          />
          <SocialButton label="Continue with Facebook" icon={<FacebookIcon size={18} />} />
          <SocialButton label="Continue with X" icon={<XSocialIcon size={18} />} />
        </div>

        <p className="mt-6 text-center text-[14px] leading-[18px] text-[#6a6a6a]">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-medium text-[#222] underline underline-offset-2"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function SocialButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-12 w-full items-center justify-center rounded-lg border border-[#222] text-[14px] font-medium leading-[18px] text-[#222] transition hover:bg-[#f7f7f7]"
    >
      <span className="absolute left-4">{icon}</span>
      {label}
    </button>
  );
}
