import Link from "next/link";
import Image from "next/image";
import type { Experience, Service } from "@/types";
import { StarIcon } from "@/components/ui/icons";
import { WishlistButton } from "./WishlistButton";
import { formatPrice } from "@/lib/format/currency";

export interface ExperienceCardProps {
  item: Experience | Service;
  priority?: boolean;
}

/**
 * Experiences and services share a card shape: square photo, title, then
 * "From ₹X / guest · rating".
 */
export function ExperienceCard({ item, priority = false }: ExperienceCardProps) {
  const href = item.kind === "experience" ? `/experiences/${item.id}` : `/services/${item.id}`;
  const photo = item.photos[0];

  return (
    <Link
      href={href}
      data-testid="card-container"
      className="group relative block"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[#f7f7f7]">
        {photo && (
          <Image
            src={photo}
            alt={item.title}
            fill
            priority={priority}
            sizes="(max-width: 744px) 50vw, (max-width: 1128px) 25vw, 15vw"
            className="object-cover"
          />
        )}
        <WishlistButton listingId={item.id} />
      </div>

      <div className="px-1 pt-2">
        <h3
          data-testid="listing-card-title"
          className="truncate text-[13px] font-medium leading-4 text-[#222]"
        >
          {item.title}
        </h3>
        <p
          data-testid="price-availability-row"
          className="flex items-center gap-1 truncate text-[12px] leading-4 text-[#6c6c6c]"
        >
          <span className="truncate">
            From <span className="font-medium text-[#222]">{formatPrice(item.price)}</span>
            {` / ${item.priceUnit}`}
          </span>
          {item.rating !== null && (
            <>
              <span aria-hidden="true" className="font-bold text-[#c1c1c1]">
                ·
              </span>
              <span className="flex shrink-0 items-center gap-0.5 text-[#222]">
                <StarIcon size={10} />
                {item.rating.toFixed(item.rating % 1 === 0 ? 1 : 2)}
              </span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
