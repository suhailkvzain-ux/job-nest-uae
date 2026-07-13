"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormRadioGroupProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  options: { label: string; value: string }[];
  label?: string;
  required?: boolean;
  className?: string;
}

export function FormRadioGroup<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  label,
  required,
  className,
}: FormRadioGroupProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          htmlFor={name}
          label={label}
          error={fieldState.error?.message}
          required={required}
          className={className}
        >
          <RadioGroup value={field.value} onValueChange={field.onChange} id={name}>
            {options.map((option) => {
              const id = `${name}-${option.value}`;
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
        </FormFieldWrapper>
      )}
    />
  );
}
