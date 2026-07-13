import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Breadcrumb trail — the last item renders as plain text (current page),
 * every earlier item is a link. Includes a home icon by default.
 */
export function Breadcrumb({
  items,
  className,
  showHomeIcon = true,
}: {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {showHomeIcon && (
          <li className="flex items-center gap-1.5">
            <Link href="/" className="flex items-center hover:text-foreground" aria-label="Home">
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
          </li>
        )}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && "font-medium text-foreground")} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
