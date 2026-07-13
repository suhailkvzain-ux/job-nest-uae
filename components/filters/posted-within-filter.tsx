import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PostedWithin } from "@/lib/validations/job";

const POSTED_WITHIN_OPTIONS: { label: string; value: PostedWithin }[] = [
  { label: "Today", value: "today" },
  { label: "Last 3 Days", value: "3days" },
  { label: "Last Week", value: "week" },
  { label: "Last Month", value: "month" },
];

export function PostedWithinFilter({
  value,
  onChange,
}: {
  value?: PostedWithin;
  onChange: (value: PostedWithin | undefined) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold text-foreground">Posted Within</legend>
      <RadioGroup
        value={value ?? ""}
        onValueChange={(v) => onChange(v ? (v as PostedWithin) : undefined)}
      >
        {POSTED_WITHIN_OPTIONS.map((option) => {
          const id = `posted-within-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2.5">
              <RadioGroupItem value={option.value} id={id} />
              <Label htmlFor={id} className="cursor-pointer font-normal">
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
