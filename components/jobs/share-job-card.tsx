"use client";

import { Facebook, Linkedin, Mail, MessageCircle } from "lucide-react";

import { CopyButton } from "@/components/shared/copy-button";
import { IconButton } from "@/components/shared/icon-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShareJobCardProps {
  title: string;
  url: string;
  onShare?: (channel: string) => void;
}

/** Share-this-job card with per-channel links + a copy-link button. */
export function ShareJobCard({ title, url, onShare }: ShareJobCardProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const channels = [
    {
      key: "linkedin",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: "Share on LinkedIn",
    },
    {
      key: "facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: "Share on Facebook",
    },
    {
      key: "whatsapp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      label: "Share on WhatsApp",
    },
    {
      key: "email",
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      label: "Share via email",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Share this job</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        {channels.map(({ key, icon, href, label }) => (
          <a key={key} href={href} target="_blank" rel="noreferrer noopener" onClick={() => onShare?.(key)}>
            <IconButton icon={icon} aria-label={label} />
          </a>
        ))}
        <CopyButton value={url} label="Copy job link" />
      </CardContent>
    </Card>
  );
}
