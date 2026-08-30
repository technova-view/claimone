"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 20_000;
const SESSION_STORAGE_KEY = "claimone-presence-session";

function getOrCreateSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  return id;
}

// Mounted once in the root layout — sends a heartbeat on load and every 20s
// after, so presence.service.ts's "online now" count reflects real,
// currently-open tabs rather than a fabricated number. sessionStorage (not
// localStorage) is deliberate: a closed tab should stop counting as online
// once its last heartbeat ages out, not persist as "the same visitor" across
// visits.
export function PresenceHeartbeat() {
  useEffect(() => {
    let cancelled = false;

    function beat() {
      const sessionId = getOrCreateSessionId();
      fetch("/api/presence/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        keepalive: true,
      }).catch(() => {});
    }

    beat();
    const interval = setInterval(() => {
      if (!cancelled) beat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return null;
}
