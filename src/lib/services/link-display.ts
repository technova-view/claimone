// Pure, render-time-safe helpers for showing a bid's URL or X handle —
// no network calls here, so these are fine to use in both server and client
// components.

export function faviconUrlFor(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return null;
  }
}

export function xAvatarUrlFor(handle: string): string {
  const clean = handle.replace(/^@/, "");
  return `https://unavatar.io/x/${encodeURIComponent(clean)}`;
}

export function displayHostFor(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function outboundLinkFor(bid: { url: string | null; handle: string | null }): string {
  if (bid.url) return bid.url;
  if (bid.handle) return `https://x.com/${bid.handle.replace(/^@/, "")}`;
  return "#";
}

const TIME_AGO_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

const timeAgoFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  for (const [unit, unitSeconds] of TIME_AGO_UNITS) {
    if (seconds >= unitSeconds) {
      return timeAgoFormatter.format(-Math.floor(seconds / unitSeconds), unit);
    }
  }
  return "just now";
}
