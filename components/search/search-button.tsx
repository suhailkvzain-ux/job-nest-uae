import { Search } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";

/** Standalone search submit button — pairs with `SearchInput` in a form. */
export function SearchButton({ children = "Search", ...props }: ButtonProps) {
  return (
    <Button type="submit" {...props}>
      <Search className="h-4 w-4" /> {children}
    </Button>
  );
}
