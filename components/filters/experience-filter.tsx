import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const EXPERIENCE_RANGES = ["0-1 years", "1-3 years", "3-5 years", "5-8 years", "8+ years"];

export function ExperienceFilter({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold text-foreground">Experience</legend>
      <RadioGroup value={value} onValueChange={onChange}>
        {EXPERIENCE_RANGES.map((range) => {
          const id = `experience-${range}`;
          return (
            <div key={range} className="flex items-center gap-2.5">
              <RadioGroupItem value={range} id={id} />
              <Label htmlFor={id} className="cursor-pointer font-normal text-foreground">
                {range}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </fieldset>
  );
}
