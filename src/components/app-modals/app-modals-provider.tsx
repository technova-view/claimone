"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ClaimModal, type ClaimTarget } from "@/components/claim/claim-modal";
import { HallOfFameModal } from "@/components/leaderboard/hall-of-fame-modal";

type HallOfFameScopeSlug = "daily" | "weekly";

interface AppModalsContextValue {
  openClaim: (target: ClaimTarget) => void;
  openHallOfFame: (scope: HallOfFameScopeSlug) => void;
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

  const openClaim = useCallback((target: ClaimTarget) => setClaimTarget(target), []);
  const openHallOfFame = useCallback((scope: HallOfFameScopeSlug) => setHofScope(scope), []);

  const value = useMemo(() => ({ openClaim, openHallOfFame }), [openClaim, openHallOfFame]);

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
