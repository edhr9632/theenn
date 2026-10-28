"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BootstrapClient() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    void import("bootstrap").then(({ Dropdown, Collapse }) => {
      if (cancelled) return;

      document.querySelectorAll<HTMLElement>('[data-bs-toggle="dropdown"]').forEach((el) => {
        Dropdown.getOrCreateInstance(el);
      });

      document.querySelectorAll<HTMLElement>('[data-bs-toggle="collapse"]').forEach((el) => {
        Collapse.getOrCreateInstance(el);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
