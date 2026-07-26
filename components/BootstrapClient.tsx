"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BootstrapClient() {
  const pathname = usePathname();

  useEffect(() => {
    void import("bootstrap").then(({ Dropdown, Collapse }) => {
      document.querySelectorAll<HTMLElement>('[data-bs-toggle="dropdown"]').forEach((el) => {
        Dropdown.getOrCreateInstance(el);
      });

      document.querySelectorAll<HTMLElement>('[data-bs-toggle="collapse"]').forEach((el) => {
        Collapse.getOrCreateInstance(el);
      });
    });
  }, [pathname]);

  return null;
}
