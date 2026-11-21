"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** The current time in Ottawa. Read after mount, since the page is prerendered. */
export function LocalTime({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 20_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className={`tabular-nums ${className}`} suppressHydrationWarning>
      {time ?? "--:--"}
    </span>
  );
}
