"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

/** Navigates back in history, falling back to a provided href (e.g. `/jobs`). */
export function BackButton({ fallbackHref = "/jobs", label = "Back" }: { fallbackHref?: string; label?: string }) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} className="pl-2">
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
