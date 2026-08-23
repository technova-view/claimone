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
