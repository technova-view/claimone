"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { HallOfFameList } from "@/components/leaderboard/hall-of-fame-list";
import type { HallOfFameEntry } from "@/lib/db/entities/hall-of-fame.entity";

export function HallOfFameModal({
  scope,
  open,
  onOpenChange,
}: {
  scope: "daily" | "weekly" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!scope) return null;
  // Remounts fresh per scope so `entries` starts as null (loading) without
  // needing an effect to set a loading flag synchronously.
  return <HallOfFameModalBody key={scope} scope={scope} open={open} onOpenChange={onOpenChange} />;
}

function HallOfFameModalBody({
  scope,
  open,
  onOpenChange,
}: {
  scope: "daily" | "weekly";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [entries, setEntries] = useState<HallOfFameEntry[] | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/hall-of-fame/${scope}`)
      .then((res) => res.json())
      .then(setEntries);
  }, [open, scope]);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={scope === "daily" ? "Daily Hall of Fame" : "Weekly Hall of Fame"}
      className="max-w-lg max-h-[80vh] overflow-y-auto"
    >
      {entries === null ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <HallOfFameList entries={entries} />
      )}
    </Modal>
  );
}
