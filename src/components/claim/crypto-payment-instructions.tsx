"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Loader2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { connectTronLink, isTronLinkInstalled, payWithTronLink } from "@/lib/services/tronlink-client";

interface CryptoPaymentInstructionsProps {
  bidId: string;
  payAmount: string;
  payAddress: string;
  onConfirmed: (slug: string | null) => void;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="group flex items-center justify-between gap-3 rounded-xl border border-input bg-background px-3.5 py-2.5 text-left font-mono text-sm outline-none transition-shadow hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="min-w-0 truncate">{value}</span>
        {copied ? (
          <Check className="size-4 shrink-0 text-primary" />
        ) : (
          <Copy className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
        )}
      </button>
    </div>
  );
}

// Polls checkout/crypto-status every 4s while the buyer is looking at these
// instructions — there's no webhook to tell us the moment payment lands
// (this is a direct wallet-to-wallet transfer, not a processor with a
// callback), so this poll is what actually confirms the bid.
export function CryptoPaymentInstructions({
  bidId,
  payAmount,
  payAddress,
  onConfirmed,
}: CryptoPaymentInstructionsProps) {
  const [checking, setChecking] = useState(false);
  const confirmedRef = useRef(false);
  const [tronLinkAvailable, setTronLinkAvailable] = useState(false);
  const [walletState, setWalletState] = useState<"idle" | "connecting" | "sending" | "submitted" | "error">("idle");
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe browser-extension detection, mirrors the theme-mount pattern elsewhere in this codebase
    setTronLinkAvailable(isTronLinkInstalled());
  }, []);

  async function handlePayWithTronLink() {
    setWalletError(null);
    try {
      setWalletState("connecting");
      await connectTronLink();
      setWalletState("sending");
      await payWithTronLink(payAddress, payAmount);
      setWalletState("submitted");
    } catch (err) {
      setWalletState("error");
      setWalletError(err instanceof Error ? err.message : "Something went wrong sending the payment.");
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (confirmedRef.current) return;
      setChecking(true);
      try {
        const res = await fetch(`/api/checkout/crypto-status/${bidId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "active") {
            confirmedRef.current = true;
            onConfirmed(data.slug ?? null);
          }
        }
      } finally {
        setChecking(false);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [bidId, onConfirmed]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Send USDT on the Tron (TRC-20) network only.</span> Any
          other network or token will not be detected, and cannot be recovered.
        </p>
        <Link
          href="/how-to-pay"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex shrink-0 items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Need guideline?
          <ArrowRight className="size-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {tronLinkAvailable && walletState !== "submitted" && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="lg"
            onClick={handlePayWithTronLink}
            disabled={walletState === "connecting" || walletState === "sending"}
            className="gap-2"
          >
            {walletState === "connecting" || walletState === "sending" ? (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : (
              <Wallet className="size-4 shrink-0" />
            )}
            {walletState === "connecting"
              ? "Connecting to TronLink…"
              : walletState === "sending"
                ? "Confirm in TronLink…"
                : "Pay with TronLink"}
          </Button>
          {walletError && <p className="text-xs text-destructive">{walletError}</p>}
          <p className="text-center text-xs text-muted-foreground">or send manually:</p>
        </div>
      )}

      {walletState === "submitted" && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3.5 py-2.5 text-sm text-foreground">
          <Check className="size-4 shrink-0 text-primary" />
          Sent from TronLink — waiting for it to confirm on-chain.
        </div>
      )}

      <CopyField label="Send exactly this amount (USDT)" value={payAmount} />
      <CopyField label="To this address" value={payAddress} />

      <div className={cn("flex items-center gap-2 rounded-xl border border-dashed border-border px-3.5 py-2.5 text-sm text-muted-foreground")}>
        <Loader2 className={cn("size-4 shrink-0 text-primary", checking ? "animate-spin" : "animate-spin opacity-40")} />
        Waiting for your payment to appear on-chain — this page updates automatically, usually within a minute of
        the transfer confirming.
      </div>
    </div>
  );
}
