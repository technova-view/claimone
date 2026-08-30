// One-off: fetches and stores a title for every existing bid that has a url
// but no title yet (bids created before the title feature shipped). Safe to
// re-run — it only touches rows where title is still null.
//
// Usage: npx tsx scripts/backfill-titles.ts

import { getDataSource } from "@/lib/db/data-source";
import { Bid } from "@/lib/db/entities/bid.entity";
import { fetchUrlMetadata } from "@/lib/services/link-metadata.service";
import { IsNull, Not } from "typeorm";

async function main() {
  const ds = await getDataSource();
  const repo = ds.getRepository(Bid);

  const bids = await repo.find({
    where: { url: Not(IsNull()), title: IsNull() },
  });

  console.log(`Found ${bids.length} bid(s) with a url but no title.`);

  for (const bid of bids) {
    const { title } = await fetchUrlMetadata(bid.url!);
    if (title) {
      bid.title = title;
      await repo.save(bid);
      console.log(`✓ ${bid.url} -> "${title}"`);
    } else {
      console.log(`✗ ${bid.url} -> no title found`);
    }
  }

  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
