"use client";

import Link from "next/link";

const NAV_LINKS = [
  { href: "/categories", label: "Categories" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/stats", label: "Stats" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund-policy", label: "Refund Policy" },
];

const FOUNDERS = [
  { handle: "MarufSalim35872" },
  { handle: "Waliur57" },
];

const CONTACT_EMAILS = ["waliurrahman957@gmail.com", "technova.view@gmail.com"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Built by{" "}
          {FOUNDERS.map((founder, i) => (
            <span key={founder.handle}>
              {i > 0 && " & "}
              <a
                href={`https://x.com/${founder.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                @{founder.handle}
              </a>
            </span>
          ))}
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {NAV_LINKS.map((link, i) => (
            <span key={link.href} className="flex items-center gap-2">
              {i > 0 && <span className="text-border">·</span>}
              <Link href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            </span>
          ))}
        </nav>

        <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {LEGAL_LINKS.map((link, i) => (
            <span key={link.href} className="flex items-center gap-2">
              {i > 0 && <span className="text-border">·</span>}
              <Link href={link.href} className="transition-colors hover:text-foreground">
                {link.label}
              </Link>
            </span>
          ))}
        </nav>

        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {CONTACT_EMAILS.map((email, i) => (
            <span key={email} className="flex items-center gap-2">
              {i > 0 && <span className="text-border">·</span>}
              <a href={`mailto:${email}`} className="transition-colors hover:text-foreground">
                {email}
              </a>
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
