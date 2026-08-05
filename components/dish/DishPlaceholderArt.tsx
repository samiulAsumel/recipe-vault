import { ForkPlateIcon } from "@/components/ui/icons";

interface DishPlaceholderArtProps {
  /** Localized country name to display under the icon. */
  country: string;
  /** Sets data-region so the shared --accent-* tokens resolve without
   * requiring an already-scoped ancestor (see app/globals.css). */
  regionSlug: string;
  /** "sm" for grid-card thumbnails, "lg" for the dish-detail hero fallback. */
  size?: "sm" | "lg";
  className?: string;
}

/** Designed empty-photo state — a region-tinted gradient plus a fork-and-plate
 * mark, so a dish without a manually-sourced photo yet reads as "photo
 * pending," not as a broken image. Used by DishCard and the dish-detail hero
 * block. */
export function DishPlaceholderArt({
  country,
  regionSlug,
  size = "sm",
  className,
}: DishPlaceholderArtProps): React.JSX.Element {
  return (
    <div
      data-region={regionSlug}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent-1)_14%,var(--parchment)),color-mix(in_srgb,var(--accent-3)_10%,var(--parchment)))] ${className ?? ""}`}
    >
      <ForkPlateIcon
        size={size === "lg" ? 40 : 22}
        className="text-[var(--accent-1)] opacity-70"
      />
      <span
        className={`font-meta uppercase tracking-wide text-ink/40 ${
          size === "lg" ? "text-sm" : "text-xs"
        }`}
      >
        {country}
      </span>
    </div>
  );
}
