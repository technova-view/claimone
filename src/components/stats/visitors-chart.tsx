"use client";

import { useId, useMemo, useState } from "react";

const WIDTH = 800;
const HEIGHT = 260;
const PAD_LEFT = 40;
const PAD_RIGHT = 8;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function formatTick(value: number): string {
  if (value >= 1000) return `${(value / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
  return value.toString();
}

// Picks up to `max` evenly-spaced indices, always including the first and
// last point, so the x-axis stays legible whether there are 24 hourly
// buckets or 30 daily ones.
function pickLabelIndices(count: number, max: number): number[] {
  if (count <= max) return Array.from({ length: count }, (_, i) => i);
  const step = (count - 1) / (max - 1);
  const indices = new Set<number>();
  for (let i = 0; i < max; i++) indices.add(Math.round(i * step));
  return Array.from(indices).sort((a, b) => a - b);
}

// Catmull-Rom-derived cubic Bezier smoothing — gives the gentle curve in the
// reference screenshot without pulling in a charting library.
function smoothPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;

  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export interface ChartPoint {
  label: string;
  visitors: number;
}

export function VisitorsChart({ points: dataPoints }: { points: ChartPoint[] }) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const values = dataPoints.map((p) => p.visitors);
  const maxValue = niceMax(Math.max(...values, 1));

  const points = useMemo<[number, number][]>(
    () =>
      dataPoints.map((p, i) => {
        const x = PAD_LEFT + (dataPoints.length === 1 ? 0 : (i / (dataPoints.length - 1)) * plotWidth);
        const y = PAD_TOP + plotHeight - (p.visitors / maxValue) * plotHeight;
        return [x, y];
      }),
    [dataPoints, maxValue, plotWidth, plotHeight],
  );

  const linePath = useMemo(() => smoothPath(points), [points]);
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const baseline = PAD_TOP + plotHeight;
    return `${smoothPath(points)} L ${points[points.length - 1][0]},${baseline} L ${points[0][0]},${baseline} Z`;
  }, [points, plotHeight]);

  const gridTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxValue * f));
  const labelIndices = pickLabelIndices(dataPoints.length, 8);

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const index = Math.round(((relX - PAD_LEFT) / plotWidth) * (dataPoints.length - 1));
    setHoverIndex(Math.min(dataPoints.length - 1, Math.max(0, index)));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Visitors chart">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {gridTicks.map((tick, i) => {
          const y = PAD_TOP + plotHeight - (tick / maxValue) * plotHeight;
          return (
            <g key={i}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
                opacity={0.6}
              />
              <text x={PAD_LEFT - 8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
                {formatTick(tick)}
              </text>
            </g>
          );
        })}

        {labelIndices.map((index) => {
          const x = PAD_LEFT + (dataPoints.length === 1 ? 0 : (index / (dataPoints.length - 1)) * plotWidth);
          return (
            <text key={index} x={x} y={HEIGHT - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {dataPoints[index].label}
            </text>
          );
        })}

        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {hovered && (
          <>
            <line
              x1={hovered[0]}
              x2={hovered[0]}
              y1={PAD_TOP}
              y2={PAD_TOP + plotHeight}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              opacity={0.4}
            />
            <circle cx={hovered[0]} cy={hovered[1]} r={4} fill="var(--primary)" stroke="var(--card)" strokeWidth={2} />
          </>
        )}

        <rect
          x={PAD_LEFT}
          y={PAD_TOP}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hoverIndex !== null && hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: `${(hovered[0] / WIDTH) * 100}%`,
            top: `${(hovered[1] / HEIGHT) * 100 - 2}%`,
          }}
        >
          <p className="font-semibold text-popover-foreground">{dataPoints[hoverIndex].visitors.toLocaleString()} visitors</p>
          <p className="text-muted-foreground">{dataPoints[hoverIndex].label}</p>
        </div>
      )}
    </div>
  );
}
