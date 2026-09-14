import Link from "next/link";
import { GlobeIcon, FacebookIcon, XSocialIcon, InstagramIcon } from "@/components/ui/icons";

/** Columns as scraped from the production footer. */
const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Support",
    links: [
      { label: "Help Centre", href: "/help" },
      { label: "Get help with a safety issue", href: "/help/contact-us" },
      { label: "AirCover", href: "/aircover" },
      { label: "Anti-discrimination", href: "/against-discrimination" },
      { label: "Disability support", href: "/accessibility" },
      { label: "Cancellation options", href: "/help/article/2701" },
      { label: "Report neighbourhood concern", href: "/neighbors" },
    ],
  },
  {
    heading: "Hosting",
    links: [
      { label: "Airbnb your home", href: "/host/homes" },
      { label: "Airbnb your experience", href: "/host/experiences" },
      { label: "Airbnb your service", href: "/host/services" },
      { label: "AirCover for Hosts", href: "/aircover-for-hosts" },
      { label: "Hosting resources", href: "/resources/hosting-homes" },
      { label: "Community forum", href: "/community" },
      { label: "Hosting responsibly", href: "/help/article/3126" },
      { label: "Join a free hosting class", href: "/host/academy" },
      { label: "Find a co-host", href: "/co-hosting" },
      { label: "Refer a host", href: "/refer" },
    ],
  },
  {
    heading: "Airbnb",
    links: [
      { label: "2026 Summer Release", href: "/release" },
      { label: "Newsroom", href: "/press/news" },
      { label: "Careers", href: "/careers" },
      { label: "Investors", href: "/investors" },
      { label: "Airbnb.org emergency stays", href: "/airbnb-org" },
    ],
  },
];

const LEGAL = [
  { label: "Privacy", href: "/terms/privacy_policy" },
  { label: "Terms", href: "/terms" },
  { label: "Company details", href: "/company-details" },
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-[#ebebeb] bg-[#f7f7f7]">
      <div className="mx-auto max-w-[2520px] px-6 py-12 lg:px-12">
        <div className="grid grid-cols-1 gap-8 border-b border-[#dddddd] pb-8 sm:grid-cols-2 lg:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 text-[14px] font-medium leading-[18px] text-[#222]">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] leading-[18px] text-[#6a6a6a] hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] leading-[18px] text-[#222]">
            <span>© 2026 Airbnb, Inc.</span>
            {LEGAL.map((l) => (
              <span key={l.label} className="flex items-center gap-2">
                <span aria-hidden="true">·</span>
                <Link href={l.href} className="hover:underline">
                  {l.label}
                </Link>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              className="flex items-center gap-2 text-[14px] font-medium leading-[18px] text-[#222] hover:underline"
            >
              <GlobeIcon size={16} />
              English (IN)
            </button>
            <button
              type="button"
              className="text-[14px] font-medium leading-[18px] text-[#222] hover:underline"
            >
              ₹ INR
            </button>
            <div className="flex items-center gap-4 text-[#222]">
              <Link href="/" aria-label="Navigate to Facebook page">
                <FacebookIcon size={18} />
              </Link>
              <Link href="/" aria-label="Navigate to X page">
                <XSocialIcon size={18} />
              </Link>
              <Link href="/" aria-label="Navigate to Instagram page">
                <InstagramIcon size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
