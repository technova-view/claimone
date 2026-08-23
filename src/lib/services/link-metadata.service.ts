import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 2 * 1024 * 1024; // 2MB cap on response body we'll read

function isDisallowedIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 0) return true;
    return false;
  }
  // Any IPv6 loopback/unique-local/link-local address — be conservative.
  const lower = ip.toLowerCase();
  return lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80");
}

async function assertPublicHttpUrl(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http/https URLs are allowed.");
  }
  const { address } = await lookup(url.hostname);
  if (isDisallowedIp(address)) {
    throw new Error("URL resolves to a disallowed address.");
  }
}

function extractDescription(html: string): string | null {
  const metaTagRegex = /<meta\s+[^>]*>/gi;
  const tags = html.match(metaTagRegex) ?? [];
  for (const tag of tags) {
    const nameMatch = tag.match(/(?:name|property)\s*=\s*["']([^"']+)["']/i);
    const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
    if (!nameMatch || !contentMatch) continue;
    const name = nameMatch[1].toLowerCase();
    if (name === "description" || name === "og:description") {
      const value = contentMatch[1].trim();
      if (value) return value.slice(0, 500);
    }
  }
  return null;
}

// Best-effort: returns null on any failure rather than throwing, since a
// missing description shouldn't block a bid from being placed.
export async function fetchUrlDescription(rawUrl: string): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  try {
    await assertPublicHttpUrl(url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "claimone.lol-bot/1.0" },
      });
      if (!res.ok || !res.body) return null;

      const reader = res.body.getReader();
      let received = 0;
      let html = "";
      const decoder = new TextDecoder();
      while (received < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (/<\/head>/i.test(html)) break;
      }
      await reader.cancel().catch(() => {});

      return extractDescription(html);
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}
