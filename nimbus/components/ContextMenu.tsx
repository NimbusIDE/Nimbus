"use client";
import { useEffect, useRef } from "react";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};
type ContextMenuProps = {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
};

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLUListElement>(null);
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
  return (
    <ul
      ref={menuRef}
      role="menu"
      className="fixed z-50 min-w-[160px] rounded-md border border-neutral-800 bg-neutral-900 py-1 shadow-lg"
      style={{ top: position.y, left: position.x }}
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
