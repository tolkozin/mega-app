"use client";

import { useEffect, useState } from "react";
import type { TOCItem } from "@/types/blog";

export function TableOfContents({ items }: { items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = items.map((item) =>
      document.getElementById(item.id)
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const heading of headings) {
      if (heading) observer.observe(heading);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="sticky top-6">
      <h4 className="mb-3 text-sm font-semibold">On this page</h4>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className={`block py-1 transition-colors hover:text-foreground ${
                activeId === item.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
