"use client";

import { useState } from "react";

import { Slider } from "@/components/ui/slider";
import { formatNumber } from "@/utils/format";

interface SalaryFilterProps {
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
  step?: number;
}

/** Dual-thumb salary range slider for the filter sidebar. */
export function SalaryFilter({ min = 0, max = 50000, value, onChange, currency = "AED", step = 500 }: SalaryFilterProps) {
  const [local, setLocal] = useState<[number, number]>(value);

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-foreground">Salary range</legend>
      <Slider
        min={min}
        max={max}
        step={step}
        value={local}
        onValueChange={(v) => setLocal(v as [number, number])}
        onValueCommit={(v) => onChange(v as [number, number])}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {currency} {formatNumber(local[0])}
        </span>
        <span>
          {currency} {formatNumber(local[1])}
          {local[1] >= max ? "+" : ""}
        </span>
      </div>
    </fieldset>
  );
}
