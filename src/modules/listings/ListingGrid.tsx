import { ListingCard } from "./ListingCard";
import type { FeedListing } from "./repo";

export function ListingGrid({ listings }: { listings: FeedListing[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <li key={listing.id}>
          <ListingCard listing={listing} />
        </li>
      ))}
    </ul>
  );
}