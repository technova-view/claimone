import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeftRight, ArrowRight, CheckCircle2, ClipboardCopy, Coins, Send, ShieldAlert, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";

export const metadata: Metadata = {
  title: "How to pay with crypto · claimone.lol",
};

const STEPS = [
  {
    icon: Wallet,
    title: "Open your exchange app",
    body: "Log in to an exchange where you already hold funds — Binance, Bybit, OKX, Coinbase, and Kraken all work the same way. If you don't have USDT yet, buy it there first (card, bank transfer, or converting another coin).",
  },
  {
    icon: ArrowLeftRight,
    title: "Go to Withdraw",
    body: "From your wallet or funds page, choose Withdraw, then select USDT (Tether) as the asset.",
  },
  {
    icon: Coins,
    title: "Select the TRC20 (Tron) network",
    body: "The exchange will ask which network to send USDT on. You must choose TRC20 / Tron — not ERC20, BEP20, Solana, or any other option. This is the single most important step.",
  },
  {
    icon: ClipboardCopy,
    title: "Paste the address and amount from checkout",
    body: "Copy the payment address and the exact USDT amount shown on your ClaimOne checkout screen (the amount is unique to your bid — sending a different amount can delay detection).",
  },
  {
    icon: Send,
    title: "Confirm and send",
    body: "Review the network (TRC20) and address one more time, then confirm. Most transfers land within a minute or two — this page checks automatically and activates your bid as soon as it's detected.",
  },
];

export default function HowToPayPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-10">
        <div className="flex flex-col gap-2">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet className="size-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">How to pay with crypto</h1>
          <p className="text-muted-foreground">
            ClaimOne is paid in USDT on the Tron (TRC20) network. If you don&apos;t already hold crypto, the easiest way
            to get some is to send USDT from an exchange account like Binance — here&apos;s exactly how.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-semibold text-destructive">Network matters more than anything else here.</p>
            <p className="mt-1 text-muted-foreground">
              Only USDT sent on the <span className="font-semibold text-foreground">TRC20 (Tron)</span> network will
              be detected. Sending on Ethereum (ERC20), BNB Smart Chain (BEP20), Solana, or any other network sends
              the funds to an address we can&apos;t see them on — that payment cannot be recovered.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-semibold tracking-tight">Step by step</h2>
          <ol className="flex flex-col gap-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <step.icon className="size-4 shrink-0 text-primary" />
                    {step.title}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/30 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Already have a crypto wallet?
          </p>
          <p className="text-sm text-muted-foreground">
            If you use a wallet like TronLink, Trust Wallet, or any wallet holding USDT on Tron, you can skip the
            exchange entirely — just send directly from your wallet to the address on the checkout screen, on the
            TRC20 network.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Crypto payments are generally irreversible once confirmed on-chain. Double-check the network and address
            before sending — see our{" "}
            <Link href="/refund-policy" className="font-medium text-primary hover:underline">
              refund policy
            </Link>{" "}
            for what happens if something goes wrong.
          </p>
        </div>

        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Back to the leaderboard
          <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </main>
    </div>
  );
}
