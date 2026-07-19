"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Position } from "@/types/workspace";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};
type ContextMenuProps = {
  items: ContextMenuItem[];
  position: Position;
  onClose: () => void;
};

// Floating right-click menu used by the file explorer. The item list is
// built by the caller (ExplorerPanel) for three targets:
// - Files: Open, Rename, Duplicate, Delete
// - Folders: New File, New Folder, Rename, Delete
// - Empty panel space: New File, New Folder
//
// This component only handles presentation and dismissal (outside click,
// Escape, or clicking an item) — it doesn't know what "target" it's for.
export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLUListElement>(null);

  // Start at the raw click point, then clamp on-screen below before paint.
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Close on outside click or Escape, matching native context menu behavior.
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Nudge the menu back on-screen if the click point would render it
  // partially past the right or bottom edge of the viewport. Runs
  // synchronously before paint so there's no visible jump.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const { width, height } = menu.getBoundingClientRect();
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    setAdjustedPosition({
      x: Math.max(0, Math.min(position.x, maxX)),
      y: Math.max(0, Math.min(position.y, maxY)),
    });
  }, [position]);

  return (
    <ul
      ref={menuRef}
      role="menu"
      className="fixed z-50 min-w-[160px] rounded-md border border-neutral-800 bg-neutral-900 py-1 shadow-lg"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
    >
      {items.map((item) => (
        <li key={item.label} role="none">
          <button
            type="button"
            role="menuitem"
            className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-800 ${
              item.destructive ? "text-red-400" : "text-neutral-200"
            }`}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
