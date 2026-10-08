"use client";

import { useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

export function CategoryChips({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 sm:flex-wrap">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
            active === null
              ? "bg-brand text-on-brand"
              : "border border-line bg-surface text-ink hover:border-ink-muted/40"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              active === c.id
                ? "bg-brand text-on-brand"
                : "border border-line bg-surface text-ink hover:border-ink-muted/40"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}