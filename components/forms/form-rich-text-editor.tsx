"use client";

import { Bold, Heading2, Heading3, Italic, List, ListOrdered, Pilcrow } from "lucide-react";
import { useRef } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { IconButton } from "@/components/shared/icon-button";
import { cn } from "@/lib/utils";

/**
 * The public job-detail components (JobDescription/RequirementsList/
 * ResponsibilitiesList/BenefitsList in components/jobs/job-content.tsx)
 * expect plain text with blank-line-separated blocks, NOT HTML - they
 * split on newlines and render each line as escaped text. But this editor
 * is a native contentEditable region, and reading innerHTML directly (as
 * this component used to) captures the browser's raw per-line div/p
 * wrapper tags as part of the saved string, which then shows up as
 * literal "<div>" text on the public page. This function converts the
 * edited DOM into that expected plain-text format instead: each top-level
 * block element (p/div/h2/h3, and each individual li inside a list)
 * becomes its own line, blocks are joined with a blank line between them
 * so both the double-newline paragraph split and the single-newline
 * bullet split downstream work correctly.
 */
function htmlToPlainText(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;
  const lines: string[] = [];
  Array.from(container.children).forEach((child) => {
    if (child.tagName === "UL" || child.tagName === "OL") {
      Array.from(child.children).forEach((li) => {
        const text = (li.textContent ?? "").trim();
        if (text) lines.push(text);
      });
    } else {
      const text = (child.textContent ?? "").trim();
      if (text) lines.push(text);
    }
  });
  if (lines.length === 0) {
    const text = (container.textContent ?? "").trim();
    if (text) lines.push(text);
  }
  return lines.join("\n\n");
}

interface FormRichTextEditorProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * Lightweight rich text editor — a `contentEditable` region with a
 * bold/italic/heading/list toolbar (via `document.execCommand`, still
 * broadly supported for this exact use case). This project's tech stack
 * doesn't include a WYSIWYG library (TipTap/Lexical/etc.); Phase 9 added
 * heading support (H2/H3 + "paragraph" to clear one) to the bold/italic/
 * list toolbar already built in Phase 3, covering the job form's
 * "bullet lists and headings" requirement without pulling in a new
 * dependency. Swap for a dedicated editor library later if richer
 * formatting (tables, embeds, mentions) is ever needed.
 */
export function FormRichTextEditor<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  className,
  placeholder = "Start writing…",
}: FormRichTextEditorProps<TFieldValues>) {
  const editorRef = useRef<HTMLDivElement>(null);

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
          <div className="rounded-xl border border-input shadow-sm">
            <div className="flex flex-wrap items-center gap-1 border-b border-border/60 p-2">
              <IconButton
                icon={Bold}
                aria-label="Bold"
                size="sm"
                variant="ghost"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand("bold")}
              />
              <IconButton
                icon={Italic}
                aria-label="Italic"
                size="sm"
                variant="ghost"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand("italic")}
              />
              <span className="mx-1 h-5 w-px bg-border/60" aria-hidden="true" />
              <IconButton
                icon={Heading2}
                aria-label="Heading 2"
                size="sm"
                variant="ghost"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand("formatBlock", false, "h2")}
              />
              <IconButton
                icon={Heading3}
                aria-label="Heading 3"
                size="sm"
                variant="ghost"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand("formatBlock", false, "h3")}
              />
              <IconButton
                icon={Pilcrow}
                aria-label="Paragraph (clear heading)"
                size="sm"
                variant="ghost"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand("formatBlock", false, "p")}
              />
              <span className="mx-1 h-5 w-px bg-border/60" aria-hidden="true" />
              <IconButton
                icon={List}
                aria-label="Bullet list"
                size="sm"
                variant="ghost"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand("insertUnorderedList")}
              />
              <IconButton
                icon={ListOrdered}
                aria-label="Numbered list"
                size="sm"
                variant="ghost"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand("insertOrderedList")}
              />
            </div>
            <div
              ref={editorRef}
              id={name}
              role="textbox"
              aria-multiline="true"
              aria-invalid={Boolean(fieldState.error)}
              contentEditable
              suppressContentEditableWarning
              data-placeholder={placeholder}
              className={cn(
                "min-h-[160px] whitespace-pre-wrap px-4 py-3 text-sm outline-none",
                "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2:first-child]:mt-0",
                "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3:first-child]:mt-0",
                "[&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5",
                "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
              )}
              dangerouslySetInnerHTML={{ __html: field.value ?? "" }}
              onBlur={(e) => field.onChange(htmlToPlainText(e.currentTarget.innerHTML))}
            />
          </div>
        </FormFieldWrapper>
      )}
    />
  );
}
