// Small pulsing dot marking a stat as live-updating — same green ping
// pattern as the site-wide "online" indicator in StatusBar.
export function LiveDot() {
  return (
    <span className="relative flex size-1.5 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex h-full w-full rounded-full bg-green-500" />
    </span>
  );
}
