"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Textarea } from "@/components/ui/textarea";

interface FormTextareaProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}

export function FormTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  rows = 6,
  className,
}: FormTextareaProps<TFieldValues>) {
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
          <Textarea
            {...field}
            id={name}
            rows={rows}
            placeholder={placeholder}
            value={field.value ?? ""}
            aria-invalid={Boolean(fieldState.error)}
          />
        </FormFieldWrapper>
      )}
    />
  );
}
