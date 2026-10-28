"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type NavDropdownProps = {
  label: string;
  active?: boolean;
  children: ReactNode;
};

export default function NavDropdown({ label, active = false, children }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <li className={`nav-item dropdown${open ? " show" : ""}`} ref={rootRef}>
      <button
        type="button"
        className={`nav-link dropdown-toggle px-3 fw-medium bg-transparent border-0${active ? " active" : ""}${open ? " show" : ""}`}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      <ul
        id={menuId}
        className={`dropdown-menu border-0 shadow${open ? " show" : ""}`}
        role="menu"
        onClick={() => setOpen(false)}
      >
        {children}
      </ul>
    </li>
  );
}
