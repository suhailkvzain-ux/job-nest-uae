"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormCheckboxProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  className?: string;
}

export function FormCheckbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  className,
}: FormCheckboxProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn("flex items-center gap-2.5", className)}>
          <Checkbox id={name} checked={Boolean(field.value)} onCheckedChange={field.onChange} />
          <Label htmlFor={name} className="cursor-pointer font-normal">
            {label}
          </Label>
        </div>
      )}
    />
  );
}
