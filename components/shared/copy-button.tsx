"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { IconButton } from "@/components/shared/icon-button";

/** Copies `value` to the clipboard and shows a brief check-mark confirmation. */
export function CopyButton({ value, label = "Copy link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — fail silently
      // rather than throw in the UI; the user can still select/copy manually.
    }
  }

  return (
    <IconButton
      icon={copied ? Check : Copy}
      aria-label={copied ? "Copied" : label}
      onClick={handleCopy}
      variant={copied ? "secondary" : "outline"}
    />
  );
}
