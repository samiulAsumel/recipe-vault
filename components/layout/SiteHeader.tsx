import Link from "next/link";
import { CONTINENTS, MEAL_TIMES, OCCASIONS } from "@/lib/constants";

export function SiteHeader(): React.JSX.Element {
  return (
    <header className="border-b border-clay-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          World Kitchen Atlas
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm text-ink/80">
          {CONTINENTS.map((continent) => (
            <Link key={continent.slug} href={`/${continent.slug}`} className="hover:text-turmeric">
              {continent.name}
            </Link>
          ))}
          {MEAL_TIMES.map((mealTime) => (
            <Link key={mealTime.slug} href={`/${mealTime.slug}`} className="hover:text-turmeric">
              {mealTime.name}
            </Link>
          ))}
          {OCCASIONS.map((occasion) => (
            <Link key={occasion.slug} href={`/${occasion.slug}`} className="hover:text-turmeric">
              {occasion.name}
            </Link>
          ))}
          <Link href="/search" className="hover:text-turmeric">
            Search
          </Link>
          <Link href="/about" className="hover:text-turmeric">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
