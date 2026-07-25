"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronsUpDown, Check, X, Users, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/adminApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface Instructor {
  id:               string;
  name:             string;
  email:            string;
  avatar?:          string;
  instructorTitle?: string;
  _count?:          { coursesCreated: number };
}

interface InstructorPickerProps {
  value:    string;
  onChange: (id: string) => void;
  error?:   string;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function InstructorPicker({ value, onChange, error }: InstructorPickerProps) {
  const [open,        setOpen]        = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [fetchErr,    setFetchErr]    = useState<string | null>(null);
  const hasFetched = useRef(false);

  const selected = instructors.find((i) => i.id === value) ?? null;

  const fetchInstructors = useCallback(async (q?: string) => {
    setLoading(true);
    setFetchErr(null);
    try {
      const data = await adminApi.get<Instructor[]>(
        "instructors",
        q?.trim() ? { search: q.trim() } : undefined
      );
      setInstructors(data);
    } catch (e: unknown) {
      setFetchErr((e as Error).message ?? "Failed to load instructors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && !hasFetched.current) {
      hasFetched.current = true;
      void fetchInstructors();
    }
  }, [open, fetchInstructors]);

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          {/* render as div to avoid nested <button> — PopoverTrigger is a button */}
          <div
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm",
              "bg-input/30 dark:bg-input/30 border-input transition-all outline-none",
              "hover:border-ring/60",
              open       && "border-ring ring-3 ring-ring/50",
              error      && "border-destructive ring-3 ring-destructive/20",
              !selected  && "text-muted-foreground"
            )}
          >
            {selected ? (
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Avatar className="size-6 shrink-0">
                  <AvatarImage src={selected.avatar} />
                  <AvatarFallback className="text-[0.6rem] font-black bg-gradient-to-br from-violet-500 to-cyan-500 text-white">
                    {initials(selected.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <span className="font-medium text-foreground truncate block leading-tight">
                    {selected.name}
                  </span>
                  {selected.instructorTitle && (
                    <span className="text-[0.68rem] text-muted-foreground truncate block leading-tight">
                      {selected.instructorTitle}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <Users size={14} />
                Select instructor…
              </span>
            )}
            <div className="flex items-center gap-1 shrink-0">
              {selected && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(""); }}
                  className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={13} />
                </button>
              )}
              <ChevronsUpDown size={14} className="text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search instructors…"
              onValueChange={(q) => { void fetchInstructors(q); }}
            />
            <CommandList className="max-h-64">
              {fetchErr && (
                <div className="px-4 py-4 text-center">
                  <p className="text-sm text-destructive flex items-center justify-center gap-1.5">
                    <AlertCircle size={13} /> {fetchErr}
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchInstructors()}
                    className="text-xs text-primary underline mt-1"
                  >
                    Retry
                  </button>
                </div>
              )}
              {loading && instructors.length === 0 && (
                <div className="px-3 py-2 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                      <Skeleton className="size-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-28 rounded-full" />
                        <Skeleton className="h-2.5 w-20 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && !fetchErr && instructors.length === 0 && (
                <CommandEmpty>
                  <div className="py-6 text-center">
                    <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-muted">
                      <Users size={18} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No instructors found</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create an instructor in{" "}
                      <a href="/admin/users" target="_blank" className="text-primary underline">
                        User Management
                      </a>
                    </p>
                  </div>
                </CommandEmpty>
              )}
              {instructors.length > 0 && (
                <CommandGroup>
                  {instructors.map((inst) => (
                    <CommandItem
                      key={inst.id}
                      value={inst.id}
                      onSelect={() => { onChange(inst.id); setOpen(false); }}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={inst.avatar} />
                        <AvatarFallback className="text-[0.62rem] font-black bg-gradient-to-br from-violet-500 to-cyan-500 text-white">
                          {initials(inst.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{inst.name}</span>
                          {inst._count && inst._count.coursesCreated > 0 && (
                            <Badge variant="secondary" className="text-[0.62rem] h-4 px-1.5 shrink-0">
                              {inst._count.coursesCreated} course{inst._count.coursesCreated !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate block">
                          {inst.instructorTitle ?? inst.email}
                        </span>
                      </div>
                      <Check
                        size={14}
                        className={cn(
                          "shrink-0 text-primary transition-opacity",
                          value === inst.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            {instructors.length > 0 && (
              <div className="border-t px-3 py-2 text-[0.68rem] text-muted-foreground">
                {instructors.length} instructor{instructors.length !== 1 ? "s" : ""}
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <p className="flex items-center gap-1 text-[0.71rem] text-destructive">
          <AlertCircle size={11} className="shrink-0" />{error}
        </p>
      )}
    </div>
  );
}
