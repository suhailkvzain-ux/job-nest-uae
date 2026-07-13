import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface FeaturedVerifiedFilterProps {
  featured: boolean;
  verified: boolean;
  onFeaturedChange: (value: boolean) => void;
  onVerifiedChange: (value: boolean) => void;
}

/** Two independent toggles — "Featured Jobs" and "Verified Jobs" only. */
export function FeaturedVerifiedFilter({
  featured,
  verified,
  onFeaturedChange,
  onVerifiedChange,
}: FeaturedVerifiedFilterProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold text-foreground">Show only</legend>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="filter-featured" className="cursor-pointer font-normal">
          Featured Jobs
        </Label>
        <Switch id="filter-featured" checked={featured} onCheckedChange={onFeaturedChange} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="filter-verified" className="cursor-pointer font-normal">
          Verified Jobs
        </Label>
        <Switch id="filter-verified" checked={verified} onCheckedChange={onVerifiedChange} />
      </div>
    </fieldset>
  );
}
