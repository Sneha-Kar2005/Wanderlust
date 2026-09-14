import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

/** Matches Airbnb's production button metrics: 48px tall CTA, fully rounded. */
const variants: Record<Variant, string> = {
  primary:
    "bg-rausch-gradient text-white hover:brightness-[0.94] active:scale-[0.98]",
  secondary:
    "bg-white text-[#222] border border-[#222] hover:bg-[#f7f7f7] active:scale-[0.98]",
  dark: "bg-[#222] text-white hover:bg-black active:scale-[0.98]",
  ghost: "bg-transparent text-[#222] hover:bg-[#f7f7f7]",
  link: "bg-transparent text-[#222] underline underline-offset-2 hover:text-black",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[14px] leading-[18px] rounded-lg",
  md: "h-12 px-6 text-[16px] leading-[20px] rounded-lg",
  lg: "h-12 px-6 text-[16px] leading-[20px] rounded-full",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
