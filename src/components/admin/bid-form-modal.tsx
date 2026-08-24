"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { BidScope } from "@/lib/types/scope";
import type { AdminBidRow, StandingRow } from "@/lib/services/admin-bids.service";

const SCOPE_LABELS: Record<BidScope, string> = {
  [BidScope.DAILY]: "Daily",
  [BidScope.WEEKLY]: "Weekly",
  [BidScope.ALL_TIME]: "All-time",
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function BidFormModal({
  open,
  onOpenChange,
  categories,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { slug: string; name: string }[];
  editing: AdminBidRow | null;
  onSaved: () => void;
}) {
  const [scope, setScope] = useState<BidScope>(BidScope.ALL_TIME);
  const [categorySlug, setCategorySlug] = useState("");
  const [linkType, setLinkType] = useState<"url" | "handle">("url");
  const [linkValue, setLinkValue] = useState("");
  const [amountDollars, setAmountDollars] = useState("");
  const [targetRank, setTargetRank] = useState("");
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    /* eslint-disable react-hooks/set-state-in-effect -- resetting the form when the modal opens is the effect's whole job */
    if (editing) {
      setScope(editing.scope);
      setCategorySlug(editing.categorySlug);
      setLinkType(editing.handle ? "handle" : "url");
      setLinkValue(editing.handle ?? editing.url ?? "");
      setAmountDollars((editing.amountCents / 100).toString());
    } else {
      setScope(BidScope.ALL_TIME);
      setCategorySlug(categories[0]?.slug ?? "");
      setLinkType("url");
      setLinkValue("");
      setAmountDollars("");
    }
    setTargetRank("");
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, editing, categories]);

  useEffect(() => {
    if (!open || !categorySlug) return;
    const params = new URLSearchParams({ scope, categorySlug });
    if (editing) params.set("excludeId", editing.id);
    fetch(`/api/admin/bids/standings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setStandings(data.rows ?? []))
      .catch(() => setStandings([]));
  }, [open, scope, categorySlug, editing]);

  function applySuggestedRank() {
    const rank = Number(targetRank);
    if (!Number.isInteger(rank) || rank < 1) return;
    const index = rank - 1;
    let suggestedCents: number;
    if (standings.length === 0) suggestedCents = 500;
    else if (index <= 0) suggestedCents = standings[0].amountCents + 100;
    else if (index >= standings.length) suggestedCents = Math.max(1, standings[standings.length - 1].amountCents - 100);
    else {
      const above = standings[index - 1].amountCents;
      const below = standings[index].amountCents;
      const mid = Math.floor((above + below) / 2);
      suggestedCents = mid > below ? mid : above;
    }
    setAmountDollars((suggestedCents / 100).toString());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amountCents = Math.round(Number(amountDollars) * 100);
    if (!Number.isInteger(amountCents) || amountCents < 1) {
      setError("Enter a valid amount.");
      return;
    }
    if (!linkValue.trim()) {
      setError("Enter a URL or handle.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        scope,
        categorySlug,
        amountCents,
        url: linkType === "url" ? linkValue.trim() : null,
        handle: linkType === "handle" ? linkValue.trim() : null,
      };
      const res = await fetch(editing ? `/api/admin/bids/${editing.id}` : "/api/admin/bids", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Save failed.");
        return;
      }
      onSaved();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={editing ? "Edit item" : "Add ranked item"} className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Scope
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as BidScope)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {Object.values(BidScope).map((s) => (
                <option key={s} value={s}>
                  {SCOPE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Category
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Listing</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLinkType("url")}
                className={`rounded-md px-2 py-1 ${linkType === "url" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setLinkType("handle")}
                className={`rounded-md px-2 py-1 ${linkType === "handle" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
              >
                X handle
              </button>
            </div>
            <input
              type="text"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder={linkType === "url" ? "https://example.com" : "handle"}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Amount ($)
            <input
              type="number"
              min={0.01}
              step={0.01}
              value={amountDollars}
              onChange={(e) => setAmountDollars(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <div className="flex items-end gap-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Insert at rank
              <input
                type="number"
                min={1}
                value={targetRank}
                onChange={(e) => setTargetRank(e.target.value)}
                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <Button type="button" variant="outline" onClick={applySuggestedRank}>
              Suggest
            </Button>
          </div>
        </div>

        {standings.length > 0 && (
          <div className="max-h-32 overflow-y-auto rounded-lg border border-border p-2 text-xs">
            <p className="mb-1 font-medium text-muted-foreground">Current standings ({SCOPE_LABELS[scope]})</p>
            {standings.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-2 py-0.5 text-muted-foreground">
                <span className="truncate">
                  #{row.rank} {row.label}
                </span>
                <span className="font-mono">{formatAmount(row.amountCents)}</span>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving} className="h-10">
          {saving ? "Saving…" : editing ? "Save changes" : "Add item"}
        </Button>
      </form>
    </Modal>
  );
}
