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

function extractMetaContent(html: string, wantedNames: string[]): string | null {
  const metaTagRegex = /<meta\s+[^>]*>/gi;
  const tags = html.match(metaTagRegex) ?? [];
  for (const wanted of wantedNames) {
    for (const tag of tags) {
      const nameMatch = tag.match(/(?:name|property)\s*=\s*["']([^"']+)["']/i);
      const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
      if (!nameMatch || !contentMatch) continue;
      if (nameMatch[1].toLowerCase() !== wanted) continue;
      const value = contentMatch[1].trim();
      if (value) return value;
    }
  }
  return null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractDescription(html: string): string | null {
  const value = extractMetaContent(html, ["og:description", "description"]);
  return value ? decodeHtmlEntities(value).slice(0, 500) : null;
}

// og:title tends to be the cleaner "brand name" a site sets deliberately for
// link previews; the <title> tag is the universal fallback every page has.
function extractTitle(html: string): string | null {
  const metaTitle = extractMetaContent(html, ["og:title"]);
  if (metaTitle) return decodeHtmlEntities(metaTitle).slice(0, 200);

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const value = decodeHtmlEntities(titleMatch[1].trim().replace(/\s+/g, " "));
    if (value) return value.slice(0, 200);
  }
  return null;
}

export interface UrlMetadata {
  title: string | null;
  description: string | null;
}

// Best-effort: returns nulls on any failure rather than throwing, since
// missing metadata shouldn't block a bid from being placed.
export async function fetchUrlMetadata(rawUrl: string): Promise<UrlMetadata> {
  const empty: UrlMetadata = { title: null, description: null };
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return empty;
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
      if (!res.ok || !res.body) return empty;

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

      return { title: extractTitle(html), description: extractDescription(html) };
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return empty;
  }
}
