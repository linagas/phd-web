"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

interface ClientRowMenuProps {
  clientName: string;
  /** When set, shows a "Publicar" item linking to the review page. */
  publishHref?: string;
  /** When set, shows an "Eliminar" item that triggers this callback. */
  onRequestDelete?: () => void;
}

interface MenuPosition {
  top: number;
  right: number;
}

const ITEM_CLASSES =
  "block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-white/10 focus-visible:outline-none focus-visible:bg-white/10";

/**
 * Kebab (⋮) actions menu. The open menu is rendered in a portal on
 * `document.body` with fixed coordinates from the trigger's bounding rect:
 * `phd-glass` uses `backdrop-filter`, which becomes the containing block for
 * fixed descendants, and the table's scroll container would clip it otherwise. Closes on Esc, outside click, scroll or resize.
 */
export default function ClientRowMenu({
  clientName,
  publishHref,
  onRequestDelete,
}: ClientRowMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      )
        close();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  if (!publishHref && !onRequestDelete) return null;

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((current) => !current);
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "ArrowDown" ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  };

  return (
    <div onClick={(event) => event.stopPropagation()} className="inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Más acciones para ${clientName}`}
        className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-slate-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan"
      >
        <span aria-hidden="true">⋮</span>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={`Acciones de ${clientName}`}
            onKeyDown={handleMenuKeyDown}
            style={{ top: position.top, right: position.right }}
            className="fixed z-50 min-w-[10rem] overflow-hidden rounded-xl border border-white/10 bg-phd-card py-1 shadow-xl"
          >
            {publishHref && (
              <Link
                href={publishHref}
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                }}
                className={`${ITEM_CLASSES} text-phd-cyan`}
              >
                Publicar
              </Link>
            )}
            {onRequestDelete && (
              <button
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                  onRequestDelete();
                }}
                className={`${ITEM_CLASSES} hover:text-phd-pink`}
              >
                Eliminar
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
