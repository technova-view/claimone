"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { faviconUrlFor, xAvatarUrlFor } from "@/lib/services/link-display";

export function ListingAvatar({
  url,
  handle,
  size = "size-10",
  radius = "rounded-xl",
  className,
}: {
  url: string | null;
  handle: string | null;
  size?: string;
  radius?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = handle ? xAvatarUrlFor(handle) : url ? faviconUrlFor(url) : null;

  if (!src || failed) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center border border-border bg-secondary text-sm font-semibold text-muted-foreground",
          size,
          radius,
          className,
        )}
      >
        ?
      </span>
    );
  }

  // Google's favicon service centers a small site icon inside the
  // requested canvas with a lot of surrounding whitespace rather than
  // cropping to fill it, which makes favicons look tiny inside the avatar
  // frame. X profile photos don't have this problem (already full-bleed),
  // so only favicons get the zoom-and-crop treatment.
  const isFavicon = !handle;

  return (
    <span className={cn("flex shrink-0 overflow-hidden border border-border bg-secondary", size, radius, className)}>
      {/* Google's favicon service 404s (with a generic icon body browsers
          won't render) for domains it hasn't indexed a favicon for yet —
          common for new/small sites, which is most of this site's listings.
          Falls back to the "?" placeholder above instead of a broken image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", isFavicon && "scale-150")}
      />
    </span>
  );
}
