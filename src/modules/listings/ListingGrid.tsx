import { ListingCard } from "./ListingCard";
import type { FeedListing } from "./repo";

export function ListingGrid({ listings }: { listings: FeedListing[] }) {
  return (
    // Cards have no box around them, so the vertical gap does the separating.
    <ul className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-y-10">
      {listings.map((listing) => (
        <li key={listing.id}>
          <ListingCard listing={listing} />
        </li>
      ))}
    </ul>
  );
}