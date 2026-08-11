"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

// Local-only terminal shell: renders xterm.js and keeps it sized to its
// container. Backend process wiring (nimbus/server/src/ws/) lands later.
export function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const term = new XTerm({ cursorBlink: true, fontSize: 14 });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(container);
    fitAddon.fit();

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
