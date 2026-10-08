import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

const BASE =
  "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition active:scale-[0.97]";
const ON = "bg-ink text-canvas";
const OFF = "border border-line bg-surface text-ink hover:border-ink-muted/50";

/**
 * Server component. The selected category lives in the URL (?category=slug),
 * so the filter survives refresh and Back, and the link can be shared.
 */
export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Categories" className="relative">
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex gap-2 sm:flex-wrap">
          <li>
            <Link
              href="/"
              scroll={false}
              aria-current={!activeSlug ? "page" : undefined}
              className={`${BASE} ${!activeSlug ? ON : OFF}`}
            >
              All
            </Link>
          </li>
          {categories.map((c) => {
            const active = activeSlug === c.slug;
            return (
              <li key={c.id}>
                <Link
                  href={`/?category=${encodeURIComponent(c.slug)}`}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={`${BASE} ${active ? ON : OFF}`}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Fade hint that the row scrolls on phones */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 -mr-4 w-10 bg-gradient-to-l from-canvas to-transparent sm:hidden"
      />
    </nav>
  );
}