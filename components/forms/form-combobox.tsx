"use client";

import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  label: string;
  value: string;
}

interface FormComboboxProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  options: ComboboxOption[];
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  /** Called when the admin types a name with no exact existing match and confirms adding it. Return the created option on success, or null on failure (the combobox stays open so they can retry). */
  onCreate: (name: string) => Promise<ComboboxOption | null>;
  /** Singular noun used in helper copy, e.g. "company", "category", "location". */
  entityName?: string;
}

/**
 * Searchable + inline-creatable dropdown, hand-built from Popover +
 * Input (no cmdk/react-select dependency available). Used for
 * reference-data fields — Company, Category, Location — where the
 * real-world option count (1000+ companies, 8+ emirates, many
 * categories) makes a fixed <Select> list impractical: admins need to
 * both find an existing entry by typing and add a brand-new one inline
 * without leaving the job form.
 */
export function FormCombobox<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  label,
  description,
  placeholder = "Search or add new…",
  required,
  className,
  onCreate,
  entityName = "option",
}: FormComboboxProps<TFieldValues>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, options]);

  const exactMatch = options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = options.find((o) => o.value === field.value);

        async function handleCreate() {
          const trimmed = query.trim();
          if (!trimmed || creating) return;
          setCreating(true);
          try {
            const created = await onCreate(trimmed);
            if (created) {
              field.onChange(created.value);
              setQuery("");
              setOpen(false);
            }
          } finally {
            setCreating(false);
          }
        }

        return (
          <FormFieldWrapper
            htmlFor={name}
            label={label}
            description={description}
            error={fieldState.error?.message}
            required={required}
            className={className}
          >
            <Popover
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) setQuery("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  id={name}
                  aria-invalid={Boolean(fieldState.error)}
                  aria-expanded={open}
                  className="w-full justify-between rounded-full font-normal"
                >
                  <span className={cn("truncate", !selected && "text-muted-foreground")}>
                    {selected ? selected.label : placeholder}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${entityName}s…`}
                  className="mb-2 h-9 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (filtered.length > 0) {
                        field.onChange(filtered[0]!.value);
                        setQuery("");
                        setOpen(false);
                      } else if (query.trim() && !exactMatch) {
                        void handleCreate();
                      }
                    }
                  }}
                />
                <div className="max-h-56 overflow-y-auto rounded-lg">
                  {filtered.length === 0 && !query.trim() && (
                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                      No {entityName}s yet. Start typing to add one.
                    </p>
                  )}
                  {filtered.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        field.onChange(option.value);
                        setQuery("");
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted",
                        option.value === field.value && "bg-muted",
                      )}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          option.value === field.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{option.label}</span>
                    </button>
                  ))}
                  {query.trim() && !exactMatch && (
                    <button
                      type="button"
                      disabled={creating}
                      onClick={handleCreate}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-primary hover:bg-muted disabled:opacity-60"
                    >
                      {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      <span className="truncate">Add &ldquo;{query.trim()}&rdquo;</span>
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </FormFieldWrapper>
        );
      }}
    />
  );
}
