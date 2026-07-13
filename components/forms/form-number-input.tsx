import type { ComponentProps } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { FormTextInput } from "@/components/forms/form-text-input";

export function FormNumberInput<TFieldValues extends FieldValues>(
  props: Omit<ComponentProps<typeof FormTextInput<TFieldValues>>, "type"> & {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
  },
) {
  return <FormTextInput {...props} type="number" />;
}
