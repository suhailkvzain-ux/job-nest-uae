"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Input } from "@/components/ui/input";

interface FormTagsInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/**
 * Comma-separated tag input for simple string-array fields (`languages`).
 * Displays/edits as a single text field ("English, Arabic, Hindi") and
 * converts to/from `string[]` at the `Controller` boundary — no
 * dedicated chip/tag-picker component exists in this project yet, and a
 * 20-line adapter here is simpler than introducing one for a single field.
 */
export function FormTagsInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "English, Arabic, Hindi",
  required,
  className,
}: FormTagsInputProps<TFieldValues>) {
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
            id={name}
            placeholder={placeholder}
            defaultValue={Array.isArray(field.value) ? field.value.join(", ") : ""}
            aria-invalid={Boolean(fieldState.error)}
            onBlur={(e) => {
              const tags = e.currentTarget.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
              field.onChange(tags);
            }}
          />
        </FormFieldWrapper>
      )}
    />
  );
}
