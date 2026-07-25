"use client";

/**
 * FormControls — wrappers around shadcn primitives with field-level
 * label + hint + error state. Keeps the CourseForm clean.
 */

import { useState, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Re-export shadcn primitives used in the form ────────────────────────────
export { Input }    from "@/components/ui/input";
export { Textarea } from "@/components/ui/textarea";
export { Label }    from "@/components/ui/label";
export { Switch }   from "@/components/ui/switch";
export { Badge }    from "@/components/ui/badge";
export { Button }   from "@/components/ui/button";
export { Separator } from "@/components/ui/separator";

// ─── FLabel ───────────────────────────────────────────────────────────────────
import { Label } from "@/components/ui/label";

export function FLabel({
  htmlFor, required, children, className,
}: {
  htmlFor?: string; required?: boolean;
  children: React.ReactNode; className?: string;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-[0.8rem] font-semibold text-foreground", className)}
    >
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Label>
  );
}

// ─── FHint ────────────────────────────────────────────────────────────────────
export function FHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[0.7rem] text-muted-foreground leading-snug">{children}</p>;
}

// ─── FError ───────────────────────────────────────────────────────────────────
export function FError({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="mt-1 flex items-center gap-1 text-[0.7rem] text-destructive"
    >
      <AlertCircle size={11} className="shrink-0" />{children}
    </motion.p>
  );
}

// ─── FField ───────────────────────────────────────────────────────────────────
export function FField({
  label, required, hint, error, children, className,
}: {
  label?: string; required?: boolean; hint?: string;
  error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && <FLabel required={required}>{label}</FLabel>}
      {children}
      {hint  && !error && <FHint>{hint}</FHint>}
      {error && <FError>{error}</FError>}
    </div>
  );
}

// ─── FInput — shadcn Input with focus ring + error state ─────────────────────
import { Input as ShadInput } from "@/components/ui/input";

interface FInputProps extends React.ComponentProps<"input"> {
  label?:      string;
  hint?:       string;
  error?:      string;
  required?:   boolean;
  prefixIcon?: React.ReactNode;
  suffix?:     React.ReactNode;
  wrapClass?:  string;
}

export function FInput({
  label, hint, error, required,
  prefixIcon, suffix, wrapClass,
  className, ...rest
}: FInputProps) {
  const id = useId();
  return (
    <div className={cn("flex flex-col", wrapClass)}>
      {label && <FLabel htmlFor={id} required={required}>{label}</FLabel>}
      <div className="relative flex items-center">
        {prefixIcon && (
          <span className="absolute left-3 flex items-center text-muted-foreground pointer-events-none">
            {prefixIcon}
          </span>
        )}
        <ShadInput
          id={id}
          className={cn(
            prefixIcon && "pl-9",
            suffix     && "pr-9",
            error      && "border-destructive focus-visible:ring-destructive/30",
            className
          )}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3 flex items-center text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint  && !error && <FHint>{hint}</FHint>}
      {error && <FError>{error}</FError>}
    </div>
  );
}

// ─── FTextarea ────────────────────────────────────────────────────────────────
import { Textarea as ShadTextarea } from "@/components/ui/textarea";

interface FTextareaProps extends React.ComponentProps<"textarea"> {
  label?:     string;
  hint?:      string;
  error?:     string;
  required?:  boolean;
  maxChars?:  number;
  wrapClass?: string;
}

export function FTextarea({
  label, hint, error, required, maxChars, wrapClass,
  className, value, onChange, ...rest
}: FTextareaProps) {
  const id       = useId();
  const charCount = typeof value === "string" ? value.length : 0;

  return (
    <div className={cn("flex flex-col", wrapClass)}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <FLabel htmlFor={id} required={required}>{label}</FLabel>
          {maxChars && (
            <span className={cn("text-[0.68rem] font-medium",
              charCount > maxChars * 0.9 ? "text-amber-500" : "text-muted-foreground")}>
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      )}
      <ShadTextarea
        id={id}
        value={value}
        onChange={onChange}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive/30",
          className
        )}
        {...rest}
      />
      {!maxChars && hint && !error && <FHint>{hint}</FHint>}
      {error && <FError>{error}</FError>}
    </div>
  );
}

// ─── FSelect — custom animated dropdown (shadcn Select is native-only) ────────
export interface SelectOption {
  value: string; label: string;
  icon?: React.ReactNode; desc?: string; color?: string;
}

interface FSelectProps {
  label?:       string;
  hint?:        string;
  error?:       string;
  required?:    boolean;
  value:        string;
  onChange:     (v: string) => void;
  options:      SelectOption[];
  placeholder?: string;
  wrapClass?:   string;
}

export function FSelect({
  label, hint, error, required,
  value, onChange, options, placeholder = "Select…", wrapClass,
}: FSelectProps) {
  const id  = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative flex flex-col", wrapClass)}>
      {label && <FLabel htmlFor={id} required={required}>{label}</FLabel>}

      <button
        id={id}
        type="button"
        onClick={() => {
          if (!open) document.addEventListener("mousedown", handleOutside, { once: true });
          setOpen((o) => !o);
        }}
        className={cn(
          "flex items-center gap-2.5 rounded-lg border bg-input/30 dark:bg-input/30 px-3 py-2 text-[0.86rem] text-left transition-all outline-none",
          "border-input focus:border-ring focus:ring-3 focus:ring-ring/50",
          open  && "border-ring ring-3 ring-ring/50",
          error && "border-destructive focus:ring-destructive/30"
        )}
      >
        {selected?.icon && <span className="shrink-0 text-muted-foreground">{selected.icon}</span>}
        <span className={cn("flex-1 truncate", selected ? (selected.color ?? "") : "text-muted-foreground")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={15} className={cn(
          "shrink-0 text-muted-foreground transition-transform duration-200",
          open && "rotate-180 text-primary"
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
            animate={{ opacity: 1, y: 0,  scaleY: 1     }}
            exit={{    opacity: 0, y: -4, scaleY: 0.96  }}
            transition={{ duration: 0.13 }}
            style={{ transformOrigin: "top" }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-popover shadow-xl"
          >
            {options.map((opt) => {
              const sel = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-[0.83rem] text-left transition-colors",
                    sel ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {opt.icon && <span className={cn("shrink-0", sel ? "text-primary" : "text-muted-foreground")}>{opt.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <span className={cn("font-medium", opt.color ?? "")}>{opt.label}</span>
                    {opt.desc && <p className="text-[0.68rem] text-muted-foreground truncate mt-0.5">{opt.desc}</p>}
                  </div>
                  {sel && <Check size={13} className="shrink-0 text-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {hint  && !error && <FHint>{hint}</FHint>}
      {error && <FError>{error}</FError>}
    </div>
  );
}
