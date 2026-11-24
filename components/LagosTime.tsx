"use client";

import { useEffect, useState } from "react";

// "Lagos, 9:41:07 AM", ticking, as on Jenn Choi's pages.
export default function LagosTime() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Africa/Lagos",
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="lagos-time">{now ? `Lagos, ${now}` : " "}</span>;
}
