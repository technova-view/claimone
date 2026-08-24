import Link from "next/link";
import { ArrowRight, BarChart3, Eye } from "lucide-react";
import { getAllTimeVisitorTotal, getOnlineRange } from "@/lib/services/stats.service";
import { OnlineCounter } from "@/components/stats/online-counter";
import { LiveDot } from "@/components/ui/live-dot";

export async function StatusBar() {
  const [range, visitorTotal] = await Promise.all([getOnlineRange(), getAllTimeVisitorTotal()]);

  return (
    <div className="flex justify-center px-4 pt-4 pb-2">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-primary/20 bg-card/80 px-5 py-2 text-xs shadow-xs backdrop-blur supports-[backdrop-filter]:bg-card/60">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="font-semibold text-green-600">
            <OnlineCounter min={range.onlineMin} max={range.onlineMax} />
          </span>
          <span className="text-muted-foreground">Online</span>
        </div>

        <span className="h-3 w-px shrink-0 bg-border" />

        {/* Visitors */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Eye className="h-3.5 w-3.5 opacity-60" />
          <span>{visitorTotal.toLocaleString()}</span>
          <span>visitors since launch</span>
        </div>

        <span className="h-3 w-px shrink-0 bg-border" />

        {/* CTA Link */}
        <Link
          href="/stats"
          className="group flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
        >
          <BarChart3 className="h-3 w-3" />
          <span>Stats</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
