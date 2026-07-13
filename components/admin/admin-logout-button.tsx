"use client";

import { LogOut } from "lucide-react";

import { signOutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Signs the admin out. A real `<form action={signOutAction}>` — not an
 * `onClick` calling the action manually — so it works identically with
 * or without client JS, and gets the same Server Action origin-check
 * (CSRF protection) as sign-in.
 */
export function AdminLogoutButton({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "full";
  className?: string;
}) {
  return (
    <form action={signOutAction}>
      {variant === "icon" ? (
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Log out"
          className={cn("text-muted-foreground hover:text-destructive", className)}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      ) : (
        <Button type="submit" variant="ghost" className={cn("w-full justify-start gap-2.5", className)}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      )}
    </form>
  );
}
