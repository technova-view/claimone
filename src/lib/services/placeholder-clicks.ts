// Click tracking doesn't exist yet — this is a stable, UI-only stand-in
// (a deterministic hash of the bid's own id, so it's consistent between
// server and client renders, and identical everywhere the same row is
// shown) until real counts are wired up.
export function placeholderClicks(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (hash % 900) + 20;
}
