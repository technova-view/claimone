"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { ClaimModal, type ClaimTarget } from "@/components/claim/claim-modal";
import { HallOfFameModal } from "@/components/leaderboard/hall-of-fame-modal";
import { BidScope } from "@/lib/types/scope";

type HallOfFameScopeSlug = "daily" | "weekly";

export interface ClaimHeroRequest {
  // Bumped on every call so effects keyed on this re-fire even when a user
  // requests the exact same scope/category/amount twice in a row.
  requestId: number;
  scope: BidScope;
  categorySlug: string;
  amountCents: number;
}

interface AppModalsContextValue {
  openClaim: (target: ClaimTarget) => void;
  openHallOfFame: (scope: HallOfFameScopeSlug) => void;
  claimHeroRequest: ClaimHeroRequest | null;
  requestClaimHero: (scope: BidScope, categorySlug: string, amountCents: number) => void;
  // Which board (All-time/Daily/Weekly) the homepage leaderboard shows —
  // lives here so the toggle in SiteHeader, which renders on every page,
  // can read and drive it. Unrelated to ClaimHero's own separate scope
  // toggle (which board to bid into).
  homeScope: BidScope;
  setHomeScope: (scope: BidScope) => void;
}

const AppModalsContext = createContext<AppModalsContextValue | null>(null);

export function useAppModals(): AppModalsContextValue {
  const ctx = useContext(AppModalsContext);
  if (!ctx) throw new Error("useAppModals must be used within AppModalsProvider");
  return ctx;
}

export function AppModalsProvider({ children }: { children: ReactNode }) {
  const [claimTarget, setClaimTarget] = useState<ClaimTarget | null>(null);
  const [hofScope, setHofScope] = useState<HallOfFameScopeSlug | null>(null);
  const [claimHeroRequest, setClaimHeroRequest] = useState<ClaimHeroRequest | null>(null);
  const claimHeroRequestId = useRef(0);
  const [homeScope, setHomeScope] = useState<BidScope>(BidScope.ALL_TIME);

  const openClaim = useCallback((target: ClaimTarget) => setClaimTarget(target), []);
  const openHallOfFame = useCallback((scope: HallOfFameScopeSlug) => setHofScope(scope), []);
  const requestClaimHero = useCallback((scope: BidScope, categorySlug: string, amountCents: number) => {
    claimHeroRequestId.current += 1;
    setClaimHeroRequest({ requestId: claimHeroRequestId.current, scope, categorySlug, amountCents });
  }, []);

  const value = useMemo(
    () => ({ openClaim, openHallOfFame, claimHeroRequest, requestClaimHero, homeScope, setHomeScope }),
    [openClaim, openHallOfFame, claimHeroRequest, requestClaimHero, homeScope],
  );

  return (
    <AppModalsContext.Provider value={value}>
      {children}
      <ClaimModal
        target={claimTarget}
        open={claimTarget !== null}
        onOpenChange={(open) => !open && setClaimTarget(null)}
      />
      <HallOfFameModal
        scope={hofScope}
        open={hofScope !== null}
        onOpenChange={(open) => !open && setHofScope(null)}
      />
    </AppModalsContext.Provider>
  );
}

export type { ClaimTarget };
