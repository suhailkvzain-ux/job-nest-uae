"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Input } from "@/components/ui/input";

interface FormTextInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "url" | "number" | "tel";
  className?: string;
}

/** RHF-connected text input — the base every typed input variant wraps. */
export function FormTextInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  type = "text",
  className,
}: FormTextInputProps<TFieldValues>) {
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
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            value={field.value ?? ""}
            aria-invalid={Boolean(fieldState.error)}
          />
        </FormFieldWrapper>
      )}
    />
  );
}
