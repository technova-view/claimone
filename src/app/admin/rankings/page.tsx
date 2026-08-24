"use client";

import { useEffect, useState } from "react";
import { EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { BidFormModal } from "@/components/admin/bid-form-modal";
import { BidScope } from "@/lib/types/scope";
import type { AdminBidRow } from "@/lib/services/admin-bids.service";

const SCOPE_LABELS: Record<BidScope, string> = {
  [BidScope.DAILY]: "Daily",
  [BidScope.WEEKLY]: "Weekly",
  [BidScope.ALL_TIME]: "All-time",
};

function formatAmount(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function AdminRankingsPage() {
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [rows, setRows] = useState<AdminBidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scopeFilter, setScopeFilter] = useState<BidScope | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBidRow | null>(null);

  const [fakeItemsEnabled, setFakeItemsEnabledState] = useState(true);
  const [fakeToggleLoading, setFakeToggleLoading] = useState(true);
  const [fakeToggleSaving, setFakeToggleSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    fetch("/api/admin/fake-items-enabled")
      .then((res) => res.json())
      .then((data) => setFakeItemsEnabledState(data.enabled ?? true))
      .finally(() => setFakeToggleLoading(false));
  }, []);

  async function handleToggleFakeItems() {
    const next = !fakeItemsEnabled;
    setFakeToggleSaving(true);
    try {
      await fetch("/api/admin/fake-items-enabled", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      setFakeItemsEnabledState(next);
    } finally {
      setFakeToggleSaving(false);
    }
  }

  async function loadRows() {
    setLoading(true);
    const params = new URLSearchParams();
    if (scopeFilter) params.set("scope", scopeFilter);
    if (categoryFilter) params.set("categorySlug", categoryFilter);
    try {
      const res = await fetch(`/api/admin/bids?${params.toString()}`);
      const data = await res.json();
      setRows(data.rows ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch on filter change is the effect's whole job
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeFilter, categoryFilter]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: AdminBidRow) {
    setEditing(row);
    setModalOpen(true);
  }

  async function handleDelete(row: AdminBidRow) {
    const label = row.handle ? `@${row.handle}` : row.url;
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/bids/${row.id}`, { method: "DELETE" });
    loadRows();
  }

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ranked items</h1>
            <p className="text-sm text-muted-foreground">Add, edit, or remove leaderboard entries — fake or real.</p>
          </div>
          <Button type="button" onClick={openAdd}>
            <Plus className="size-3.5" />
            Add item
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <EyeOff className="size-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Fake items visibility</p>
              <p className="text-xs text-muted-foreground">
                {fakeItemsEnabled
                  ? "Fake entries are shown publicly, mixed in with real ones."
                  : "Fake entries are hidden — only real, paid entries are shown publicly."}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={fakeItemsEnabled}
            disabled={fakeToggleLoading || fakeToggleSaving}
            onClick={handleToggleFakeItems}
            className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              fakeItemsEnabled ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span
              className={`inline-block size-4.5 transform rounded-full bg-white shadow transition-transform ${
                fakeItemsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as BidScope | "")}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All scopes</option>
            {Object.values(BidScope).map((s) => (
              <option key={s} value={s}>
                {SCOPE_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No items match these filters.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-secondary/40">
                  <td className="max-w-56 truncate px-4 py-3 font-medium">{row.handle ? `@${row.handle}` : row.url}</td>
                  <td className="px-4 py-3 text-muted-foreground">{SCOPE_LABELS[row.scope]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.categoryName}</td>
                  <td className="px-4 py-3 font-mono">{formatAmount(row.amountCents)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.status}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.isFake
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-green-500/15 text-green-600 dark:text-green-400"
                      }`}
                    >
                      {row.isFake ? "Fake" : "Real (paid)"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="flex size-7 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BidFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
        editing={editing}
        onSaved={loadRows}
      />
    </AdminShell>
  );
}
