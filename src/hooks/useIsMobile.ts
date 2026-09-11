"use client";

import { useEffect, useState } from "react";

/** true below Tailwind lg (1024px). SSR defaults to true to prefer mobile shell. */
export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
