"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { openPaddleCheckout } from "@/lib/paddle/client";

type Scope = "daily" | "weekly" | "all-time";

const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: "daily", label: "Daily leaderboard" },
  { value: "weekly", label: "Weekly leaderboard" },
  { value: "all-time", label: "All-time leaderboard" },
];

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const labelClass = "text-sm font-medium";

export function ClaimForm({ categories }: { categories: { slug: string; name: string }[] }) {
  const [scope, setScope] = useState<Scope>("daily");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "");
  const [url, setUrl] = useState("");
  const [handle, setHandle] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "checkout" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");

    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError("Enter a valid bid amount.");
      setStatus("error");
      return;
    }

    try {
      const scopeValue = scope === "daily" ? "daily" : scope === "weekly" ? "weekly" : "all_time";
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: scopeValue,
          categorySlug,
          url,
          handle: handle || undefined,
          title,
          description: description || undefined,
          amountCents,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("checkout");
      await openPaddleCheckout(data.transactionId);
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="scope">
          Leaderboard
        </label>
        <select
          id="scope"
          className={fieldClass}
          value={scope}
          onChange={(e) => setScope(e.target.value as Scope)}
        >
          {SCOPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="category">
          Category
        </label>
        <select
          id="category"
          className={fieldClass}
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="url">
          URL
        </label>
        <input
          id="url"
          type="url"
          required
          placeholder="https://example.com"
          className={fieldClass}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="handle">
          X @handle (optional)
        </label>
        <input
          id="handle"
          type="text"
          placeholder="@yourhandle"
          className={fieldClass}
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={200}
          className={fieldClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="description">
          Description (optional)
        </label>
        <input
          id="description"
          type="text"
          maxLength={500}
          className={fieldClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="amount">
          Bid amount (USD)
        </label>
        <input
          id="amount"
          type="number"
          min="1"
          step="1"
          required
          className={fieldClass}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={status === "submitting" || status === "checkout"}>
        {status === "submitting" ? "Preparing checkout…" : "Continue to payment"}
      </Button>
    </form>
  );
}
