"use client";

import { useEffect, useState } from "react";

export default function TopDate() {
  const [date, setDate] = useState("");

  useEffect(() => {
    const d = new Date();
    const opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" };
    setDate(d.toLocaleDateString("en-US", opts).toUpperCase());
  }, []);

  return <span className="fw-normal">{date}</span>;
}
