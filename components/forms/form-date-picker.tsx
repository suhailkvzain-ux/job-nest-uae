"use client";

import { CalendarIcon } from "lucide-react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

interface FormDatePickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  /** e.g. disable past dates for `applicationDeadline`. */
  disabled?: (date: Date) => boolean;
}

/** RHF-connected date picker — Popover + Calendar, used for `applicationDeadline` / scheduled publish dates. */
export function FormDatePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder = "Pick a date",
  required,
  className,
  disabled,
}: FormDatePickerProps<TFieldValues>) {
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={name}
                type="button"
                variant="outline"
                className={cn("w-full justify-start rounded-xl font-normal", !field.value && "text-muted-foreground")}
              >
                <CalendarIcon className="h-4 w-4" />
                {field.value ? formatDate(field.value) : placeholder}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ?? undefined}
                onSelect={field.onChange}
                disabled={disabled}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </FormFieldWrapper>
      )}
    />
  );
}
