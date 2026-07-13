"use client";

import { Share2 } from "lucide-react";

import { IconButton } from "@/components/shared/icon-button";

interface ShareButtonProps {
  title: string;
  url: string;
  onShare?: () => void;
}

/**
 * Uses the native Web Share API where available (mobile browsers), and
 * falls back to copying the URL to the clipboard on desktop. `onShare` is
 * called after a successful share/copy — hook it up to
 * `incrementShareClicks()` from the jobs service.
 */
export function ShareButton({ title, url, onShare }: ShareButtonProps) {
  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        onShare?.();
      } catch {
        // User cancelled the share sheet — not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      onShare?.();
    } catch {
      // Ignore — see CopyButton for the same tradeoff.
    }
  }

  return <IconButton icon={Share2} aria-label="Share this job" onClick={handleShare} />;
}
