"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  options: { label: string; value: string }[];
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  label,
  description,
  placeholder = "Select…",
  required,
  className,
}: FormSelectProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldWrapper
          htmlFor={name}
          label={label}
          description={description}
          error={fieldState.error?.message}
          required={required}
          className={className}
        >
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={name} aria-invalid={Boolean(fieldState.error)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      )}
    />
  );
}
