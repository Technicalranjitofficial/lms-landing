"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  BookOpen, DollarSign, Image as ImageIcon, Rocket, ListChecks,
  Layers, Plus, X, Loader2, Check, Clock, BarChart2, Zap, Eye,
  ChevronLeft, ChevronRight, AlertCircle, Upload, CheckCircle2,
  Activity, Globe, Users, Video, Code2, Brain, Settings, Monitor,
  Server, Smartphone, Save, RotateCcw, Tag as TagIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCourse } from "@/lib/adminApi";
import { getThumbnailUploadUrl } from "@/lib/uploads/r2";
import { createBunnyVideo, deleteBunnyVideo } from "@/lib/uploads/bunny";
import { uploadToR2, uploadToBunny } from "@/hooks/useUpload";
import { adminApi } from "@/lib/adminApi";
import { useCourseDraft, type CourseDraftData } from "@/hooks/useCourseDraft";
import { InstructorPicker } from "@/components/dashboard/InstructorPicker";
import { CurriculumBuilder, type CourseModule } from "@/components/dashboard/CurriculumBuilder";

// ─── shadcn primitives ────────────────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FInput, FTextarea, FSelect, FField, FLabel, FHint, FError, type SelectOption } from "@/components/dashboard/FormControls";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CoursePayload = {
  title: string; subtitle: string; description: string; longDescription: string;
  category: string; level: string; duration: string;
  price: number; originalPrice: number; currency: string;
  thumbnail: string; previewVideoId: string; instructorId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean; tag: string; accentColor: string; gradient: string;
  tags: string[]; highlights: string[]; whatYouLearn: string[]; prerequisites: string[];
  totalLectures: number; totalHours: number; modules: number; projects: number;
  curriculum: CourseModule[];
};

interface CourseFormProps {
  courseId?:    string;
  initialData?: Partial<AdminCourse & { curriculum?: CourseModule[] }>;
  onSubmit:     (payload: CoursePayload) => Promise<void>;
  submitLabel?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Web Development",    label: "Web Development",    icon: <Globe size={14} />    },
  { value: "Mobile Development", label: "Mobile Development", icon: <Smartphone size={14} /> },
  { value: "Data Science",       label: "Data Science",       icon: <Activity size={14} /> },
  { value: "Machine Learning",   label: "Machine Learning",   icon: <Brain size={14} />    },
  { value: "DevOps",             label: "DevOps",             icon: <Settings size={14} /> },
  { value: "Cybersecurity",      label: "Cybersecurity",      icon: <Monitor size={14} />  },
  { value: "System Design",      label: "System Design",      icon: <Server size={14} />   },
  { value: "DSA",                label: "DSA",                icon: <Code2 size={14} />    },
  { value: "Cloud Computing",    label: "Cloud Computing",    icon: <Globe size={14} />    },
  { value: "Other",              label: "Other",              icon: <BookOpen size={14} /> },
];

const LEVELS = [
  { value: "BEGINNER",     label: "Beginner",     desc: "No prior knowledge",   className: "border-emerald-500/40 bg-emerald-500/8 text-emerald-400"  },
  { value: "INTERMEDIATE", label: "Intermediate", desc: "Some experience",      className: "border-amber-500/40 bg-amber-500/8 text-amber-400"         },
  { value: "ADVANCED",     label: "Advanced",     desc: "Strong foundation",    className: "border-rose-500/40 bg-rose-500/8 text-rose-400"            },
];

const STATUS_OPTIONS = [
  { value: "DRAFT",     label: "Draft",     desc: "Hidden from students",  className: "border-amber-500/40 bg-amber-500/8 text-amber-400"         },
  { value: "PUBLISHED", label: "Published", desc: "Visible in catalog",    className: "border-emerald-500/40 bg-emerald-500/8 text-emerald-400"  },
  { value: "ARCHIVED",  label: "Archived",  desc: "No new enrollments",   className: "border-violet-500/40 bg-violet-500/8 text-violet-400"      },
] as const;

const ACCENT_PRESETS = ["#7c6fff","#22d3ee","#34d399","#fbbf24","#fb7185","#a78bfa","#f97316","#38bdf8"];

const GRADIENT_PRESETS = [
  { value: "from-indigo-600/80 to-purple-700/90",  label: "Indigo" },
  { value: "from-cyan-600/80 to-blue-700/90",      label: "Cyan"   },
  { value: "from-emerald-600/80 to-teal-700/90",   label: "Emerald"},
  { value: "from-violet-600/80 to-fuchsia-700/90", label: "Violet" },
  { value: "from-sky-600/80 to-indigo-700/90",     label: "Sky"    },
  { value: "from-orange-600/80 to-red-700/90",     label: "Orange" },
  { value: "from-amber-600/80 to-orange-700/90",   label: "Amber"  },
  { value: "from-rose-600/80 to-pink-700/90",      label: "Rose"   },
];

const STEPS = [
  { id: 0, label: "Basics",      icon: BookOpen,   desc: "Title, category, level"        },
  { id: 1, label: "Pricing",     icon: DollarSign, desc: "Price & discounts"             },
  { id: 2, label: "Media",       icon: ImageIcon,  desc: "Thumbnail & instructor"        },
  { id: 3, label: "Publishing",  icon: Rocket,     desc: "Status, colours"               },
  { id: 4, label: "Details",     icon: ListChecks, desc: "Outcomes & highlights"         },
  { id: 5, label: "Curriculum",  icon: Layers,     desc: "Modules & lessons"             },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function rupeesToPaise(v: string): number {
  const n = parseFloat(v.replace(/,/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}
function paiseToRupees(p: number): string { return p ? String(Math.round(p / 100)) : ""; }

// ─── Step indicator (Vercel-style horizontal) ─────────────────────────────────
function StepIndicator({ current, errors, onStep }: {
  current: number;
  errors:  Record<number, boolean>;
  onStep:  (i: number) => void;
}) {
  return (
    <nav className="flex items-center gap-0 mb-8" aria-label="Form steps">
      {STEPS.map((step, i) => {
        const Icon    = step.icon;
        const done    = i < current;
        const active  = i === current;
        const hasErr  = !!errors[i];
        const isLast  = i === STEPS.length - 1;

        return (
          <div key={step.id} className={cn("flex items-center", !isLast && "flex-1")}>
            <button
              type="button"
              onClick={() => onStep(i)}
              className="group flex flex-col items-center gap-1.5 focus:outline-none shrink-0"
            >
              {/* Circle */}
              <div className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-200",
                hasErr
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : done
                  ? "border-primary bg-primary text-primary-foreground shadow shadow-primary/30"
                  : active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground group-hover:border-primary/50 group-hover:text-foreground"
              )}>
                {hasErr
                  ? <AlertCircle size={13} />
                  : done
                  ? <Check size={13} />
                  : <Icon size={13} />}
              </div>
              {/* Label */}
              <span className={cn(
                "hidden sm:block text-[0.62rem] font-semibold whitespace-nowrap transition-colors",
                active   ? "text-foreground"
                : done   ? "text-muted-foreground"
                : hasErr ? "text-destructive"
                         : "text-muted-foreground/60"
              )}>
                {step.label}
              </span>
            </button>

            {/* Connector */}
            {!isLast && (
              <div className="flex-1 mx-2 -mt-4 h-px bg-border overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-700 ease-out"
                  style={{ width: done ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType; title: string; description: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon size={14} className="text-primary" />
        </div>
        <h2 className="font-semibold text-base text-foreground">{title}</h2>
      </div>
      <p className="text-sm text-muted-foreground ml-9">{description}</p>
    </div>
  );
}

// ─── Field group wrapper ───────────────────────────────────────────────────────
function FieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

// ─── Tag input (for lists) ─────────────────────────────────────────────────────
function TagInput({ label, hint, placeholder, items, onChange }: {
  label: string; hint?: string; placeholder: string;
  items: string[]; onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft("");
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-[0.82rem] font-semibold">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button" variant="outline" size="icon"
          onClick={add} disabled={!draft.trim()}
          className="shrink-0"
        >
          <Plus size={14} />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {items.map((item) => (
            <motion.span
              key={item}
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((i) => i !== item))}
                className="ml-0.5 rounded text-primary/60 hover:text-destructive transition-colors"
              >
                <X size={10} />
              </button>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bunny video upload zone ───────────────────────────────────────────────────
function BunnyUploadZone({ videoId, onChange, title = "Course Video" }: {
  videoId: string; onChange: (id: string) => void; title?: string;
}) {
  const inputRef       = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pct,       setPct]       = useState(0);
  const [err,       setErr]       = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (videoId) { try { await deleteBunnyVideo(videoId); } catch {} }
    setUploading(true); setPct(0); setErr(null); onChange("");
    try {
      const credentials = await createBunnyVideo(title);
      onChange(credentials.videoId);
      await uploadToBunny(file, {
        videoId:    credentials.videoId,
        libraryId:  credentials.libraryId,
        signature:  credentials.signature,
        expiration: credentials.expiration,
        title,
        onProgress: setPct,
        onError: (m) => { setErr(m); setUploading(false); },
      });
      setPct(100);
    } catch (e: unknown) {
      setErr((e as Error).message ?? "Upload failed");
    } finally { setUploading(false); }
  }

  if (videoId && !uploading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/8 p-3.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
          <CheckCircle2 size={16} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Video ready on Bunny Stream</p>
          <p className="text-[0.68rem] font-mono text-muted-foreground truncate">{videoId}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => inputRef.current?.click()}
          className="text-xs shrink-0">
          Replace
        </Button>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "group flex w-full cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed p-5 text-left transition-all",
          uploading
            ? "border-primary/40 bg-primary/5 cursor-not-allowed"
            : "border-border hover:border-primary/50 hover:bg-primary/5"
        )}
      >
        <div className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          uploading ? "bg-primary/10" : "bg-muted group-hover:bg-primary/10 transition-colors"
        )}>
          {uploading
            ? <Loader2 size={20} className="animate-spin text-primary" />
            : <Video size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />}
        </div>
        <div className="flex-1 min-w-0">
          {uploading ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Uploading to Bunny Stream…</p>
                <span className="text-sm font-bold text-primary">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <motion.div
                  animate={{ width: `${pct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500"
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">Click to upload video</p>
              <p className="text-xs text-muted-foreground">MP4, MKV, MOV — streams directly via Bunny CDN</p>
            </>
          )}
        </div>
      </button>
      {err && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle size={12} />{err}
        </p>
      )}
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Live preview sidebar ──────────────────────────────────────────────────────
function PreviewCard({ title, subtitle, thumbnail, category, level, priceRupees, origRupees,
  tag, accentColor, gradient, status, featured, duration, tags }: {
  title: string; subtitle: string; thumbnail: string; category: string;
  level: string; priceRupees: string; origRupees: string; tag: string;
  accentColor: string; gradient: string; status: string; featured: boolean;
  duration: string; tags: string[];
}) {
  const accent  = accentColor || "#7c6fff";
  const lvlObj  = LEVELS.find((l) => l.value === level) ?? LEVELS[0];
  const price   = parseInt(priceRupees || "0", 10);
  const orig    = parseInt(origRupees  || "0", 10);
  const disc    = orig > price && price > 0 ? Math.round(((orig - price) / orig) * 100) : 0;

  const checks = [
    { label: "Title",     done: title.trim().length > 2 },
    { label: "Category",  done: !!category              },
    { label: "Price",     done: !!priceRupees           },
    { label: "Thumbnail", done: !!thumbnail             },
    { label: "Published", done: status === "PUBLISHED"  },
  ];
  const doneCount = checks.filter((c) => c.done).length;

  return (
    <div className="sticky top-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Eye size={12} /> Live Preview
        </div>
        <Badge variant={doneCount === checks.length ? "default" : "secondary"} className="text-[0.6rem] h-5">
          {doneCount}/{checks.length}
        </Badge>
      </div>

      {/* Card */}
      <div
        className="overflow-hidden rounded-2xl border bg-card shadow-xl"
        style={{ boxShadow: `0 8px 40px ${accent}18` }}
      >
        {/* Thumbnail */}
        <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}30, ${accent}10)` }}>
          {thumbnail
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={thumbnail} alt="" className="h-full w-full object-cover" />
            : <div className="flex h-full items-center justify-center">
                <BookOpen size={28} style={{ color: accent }} className="opacity-20" />
              </div>}
          {gradient && thumbnail && (
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", gradient)} />
          )}
          <div className="absolute left-2 top-2 flex gap-1">
            {status === "PUBLISHED" && <Badge className="h-4 bg-emerald-500 px-1.5 text-[0.58rem]">Live</Badge>}
            {status === "DRAFT"     && <Badge variant="secondary" className="h-4 px-1.5 text-[0.58rem]">Draft</Badge>}
            {featured               && <Badge className="h-4 bg-violet-500 px-1.5 text-[0.58rem]">⭐</Badge>}
          </div>
          {tag && (
            <div className="absolute right-2 top-2">
              <span className="rounded-full px-2 py-0.5 text-[0.58rem] font-bold text-white" style={{ background: accent }}>
                {tag}
              </span>
            </div>
          )}
          {disc > 0 && (
            <div className="absolute bottom-2 right-2 rounded-full bg-destructive px-1.5 py-0.5 text-[0.58rem] font-bold text-white">
              {disc}% OFF
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-3 space-y-2.5">
          {category && (
            <span className="text-[0.58rem] font-bold uppercase tracking-widest" style={{ color: accent }}>
              {category}
            </span>
          )}
          <div>
            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-card-foreground">
              {title || <span className="font-normal italic text-muted-foreground">Course title…</span>}
            </h3>
            {subtitle && <p className="mt-0.5 line-clamp-1 text-[0.66rem] text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[0.62rem] text-muted-foreground">
            {duration && <span className="flex items-center gap-0.5"><Clock size={9} />{duration}</span>}
            <span className={cn("rounded-md border px-1.5 py-0.5 text-[0.58rem] font-semibold", lvlObj.className)}>
              {lvlObj.label}
            </span>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((t) => (
                <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[0.58rem] text-muted-foreground">{t}</span>
              ))}
              {tags.length > 3 && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[0.58rem] text-muted-foreground">+{tags.length - 3}</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-border pt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-card-foreground">
                {priceRupees ? `₹${parseInt(priceRupees, 10).toLocaleString("en-IN")}` : "Free"}
              </span>
              {orig > price && price > 0 && (
                <span className="text-[0.62rem] text-muted-foreground line-through">
                  ₹{orig.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="rounded-lg px-2.5 py-1.5 text-[0.62rem] font-bold text-white" style={{ background: accent }}>
              Enroll
            </div>
          </div>
        </div>
      </div>

      {/* Readiness checklist */}
      <div className="rounded-xl border bg-card p-3.5">
        <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">Readiness</p>
        <div className="space-y-2">
          {checks.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[0.72rem]">
              <div className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full transition-colors",
                item.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {item.done ? <Check size={9} /> : <span className="size-1 rounded-full bg-current" />}
              </div>
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main CourseForm ──────────────────────────────────────────────────────────
const panelVariants = {
  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 20 : -20 }),
  center: { opacity: 1, x: 0 },
  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -20 : 20 }),
};

export function CourseForm({ courseId, initialData, onSubmit, submitLabel = "Publish Course" }: CourseFormProps) {
  const router = useRouter();
  const d      = initialData;

  // Draft
  const draft      = useCourseDraft(courseId);
  const savedDraft = useRef<CourseDraftData | null>(
    typeof window !== "undefined" ? draft.loadDraft() : null
  ).current;

  function r<T>(dbKey: keyof CourseDraftData, dbVal: T | undefined, fallback: T): T {
    if (courseId && d) return dbVal ?? (savedDraft?.[dbKey] as T | undefined) ?? fallback;
    const draftVal = savedDraft?.[dbKey] as T | undefined;
    return draftVal ?? dbVal ?? fallback;
  }

  // Form state
  const [title,           setTitle]           = useState(() => r("title",           d?.title,                      ""));
  const [subtitle,        setSubtitle]        = useState(() => r("subtitle",         d?.subtitle,                   ""));
  const [description,     setDescription]     = useState(() => r("description",      d?.description,                ""));
  const [longDescription, setLongDescription] = useState(() => r("longDescription",  (d as any)?.longDescription,  ""));
  const [category,        setCategory]        = useState(() => r("category",          d?.category,                   ""));
  const [level,           setLevel]           = useState(() => r("level",             d?.level,                      "BEGINNER"));
  const [duration,        setDuration]        = useState(() => r("duration",          d?.duration,                   ""));
  const [priceRupees,     setPriceRupees]     = useState(() => r("priceRupees",       paiseToRupees(d?.price ?? 0),  ""));
  const [origRupees,      setOrigRupees]      = useState(() => r("origRupees",        paiseToRupees(d?.originalPrice ?? 0), ""));
  const [thumbnail,       setThumbnail]       = useState(() => r("thumbnail",         d?.thumbnail,                  ""));
  const [previewVideoId,  setPreviewVideoId]  = useState(() => r("previewVideoId",    (d as any)?.previewVideoId,    ""));
  const [instructorId,    setInstructorId]    = useState(() => r("instructorId",      d?.instructorId,               ""));
  const [status,          setStatus]          = useState<CoursePayload["status"]>(() => r("status", d?.status, "DRAFT"));
  const [featured,        setFeatured]        = useState(() => r("featured",          d?.featured,                   false));
  const [tag,             setTag]             = useState(() => r("tag",               d?.tag,                        ""));
  const [accentColor,     setAccentColor]     = useState(() => r("accentColor",       (d as any)?.accentColor,       "#7c6fff"));
  const [gradient,        setGradient]        = useState(() => r("gradient",          (d as any)?.gradient,          "from-indigo-600/80 to-purple-700/90"));
  const [tags,            setTags]            = useState<string[]>(() => r("tags",            d?.tags,            []));
  const [highlights,      setHighlights]      = useState<string[]>(() => r("highlights",      d?.highlights,      []));
  const [whatYouLearn,    setWhatYouLearn]    = useState<string[]>(() => r("whatYouLearn",    d?.whatYouLearn,    []));
  const [prerequisites,   setPrerequisites]   = useState<string[]>(() => r("prerequisites",   d?.prerequisites,   []));
  const [totalLectures,   setTotalLectures]   = useState(() => r("totalLectures",    (d as any)?.totalLectures,    0));
  const [totalHours,      setTotalHours]      = useState(() => r("totalHours",       (d as any)?.totalHours,       0));
  const [moduleCount,     setModuleCount]     = useState(() => r("modules",           (d as any)?.modules,          0));
  const [projects,        setProjects]        = useState(() => r("projects",          (d as any)?.projects,         0));
  const [curriculum,      setCurriculum]      = useState<CourseModule[]>(() => r("curriculum", (d as any)?.curriculum, []));

  // Thumbnail upload
  const thumbInputRef    = useRef<HTMLInputElement>(null);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [thumbPct,       setThumbPct]       = useState(0);
  const [thumbError,     setThumbError]     = useState<string | null>(null);

  // Stepper
  const [step, setStep] = useState(() => !courseId && savedDraft?.step ? Math.min(savedDraft.step, 5) : 0);
  const [dir,  setDir]  = useState(1);
  function goTo(i: number) { setDir(i > step ? 1 : -1); setStep(i); }
  function prev()           { if (step > 0) goTo(step - 1); }

  // Validation + saving
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({});
  const [saving,     setSaving]     = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Auto-save snapshot
  const buildSnapshot = useCallback((): CourseDraftData => ({
    title, subtitle, description, longDescription, category, level, duration,
    priceRupees, origRupees, thumbnail, previewVideoId, instructorId,
    status, featured, tag, accentColor, gradient,
    tags, highlights, whatYouLearn, prerequisites,
    totalLectures, totalHours, modules: moduleCount, projects, curriculum, step,
  }), [title, subtitle, description, longDescription, category, level, duration,
    priceRupees, origRupees, thumbnail, previewVideoId, instructorId,
    status, featured, tag, accentColor, gradient,
    tags, highlights, whatYouLearn, prerequisites,
    totalLectures, totalHours, moduleCount, projects, curriculum, step]);

  useEffect(() => { draft.saveDraft(buildSnapshot()); }, [buildSnapshot]); // eslint-disable-line

  function validateStep(s = step): boolean {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!title.trim())        e.title    = "Required";
      if (!description.trim())  e.desc     = "Required";
      if (!category)            e.category = "Required";
      if (!duration.trim())     e.duration = "Required";
    }
    if (s === 2 && !instructorId.trim()) e.instructor = "Select an instructor";
    setErrors(e);
    const hasErr = Object.keys(e).length > 0;
    setStepErrors((prev) => ({ ...prev, [s]: hasErr }));
    return !hasErr;
  }

  function handleNext() { if (validateStep()) goTo(step + 1); }

  const handleThumbFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setThumbUploading(true); setThumbPct(0); setThumbError(null);
    try {
      const { uploadUrl, publicUrl } = await getThumbnailUploadUrl(file.name);
      await uploadToR2(uploadUrl, file, file.type || "image/jpeg", { onProgress: setThumbPct });
      setThumbnail(publicUrl); setThumbPct(100);
      toast.success("Thumbnail uploaded");
    } catch (err: unknown) {
      setThumbError((err as Error).message ?? "Upload failed");
    } finally { setThumbUploading(false); }
  }, []);

  async function handleSaveDraft() {
    setSavingDraft(true);
    try {
      const payload: CoursePayload = {
        title: title.trim() || "Untitled Draft", subtitle: subtitle.trim(),
        description: description.trim() || "Draft", longDescription: longDescription.trim(),
        category: category || "Other", level, duration: duration.trim() || "TBD",
        price: rupeesToPaise(priceRupees), originalPrice: rupeesToPaise(origRupees), currency: "INR",
        thumbnail: thumbnail.trim(), previewVideoId: previewVideoId.trim(),
        instructorId: instructorId.trim(), status: "DRAFT", featured,
        tag: tag.trim(), accentColor, gradient,
        tags, highlights, whatYouLearn, prerequisites,
        totalLectures, totalHours, modules: moduleCount, projects, curriculum,
      };
      if (courseId) {
        await adminApi.put(`courses/${courseId}`, payload);
        toast.success("Draft saved");
        draft.clearDraft();
      } else {
        const created = await adminApi.post<{ id: string }>("courses", payload);
        draft.clearDraft();
        toast.success("Draft saved — redirecting…");
        setTimeout(() => router.replace(`/admin/courses/${created.id}`), 800);
      }
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to save draft");
    } finally { setSavingDraft(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let allValid = true;
    const newSE: Record<number, boolean> = {};
    [0, 2].forEach((s) => {
      const e2: Record<string, string> = {};
      if (s === 0) {
        if (!title.trim() || !description.trim() || !category || !duration.trim()) {
          e2.x = "1"; newSE[s] = true; allValid = false;
        }
      }
      if (s === 2 && !instructorId.trim()) { e2.x = "1"; newSE[s] = true; allValid = false; }
    });
    setStepErrors(newSE);
    if (!allValid) { toast.error("Fix errors in highlighted steps before publishing"); return; }
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(), subtitle: subtitle.trim(),
        description: description.trim(), longDescription: longDescription.trim(),
        category, level, duration: duration.trim(),
        price: rupeesToPaise(priceRupees), originalPrice: rupeesToPaise(origRupees), currency: "INR",
        thumbnail: thumbnail.trim(), previewVideoId: previewVideoId.trim(),
        instructorId: instructorId.trim(), status, featured,
        tag: tag.trim(), accentColor, gradient,
        tags, highlights, whatYouLearn, prerequisites,
        totalLectures, totalHours, modules: moduleCount, projects, curriculum,
      });
      draft.clearDraft();
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Something went wrong");
    } finally { setSaving(false); }
  }

  function handleCurriculumChange(next: CourseModule[]) {
    setCurriculum(next);
    const ls = next.reduce((s, m) => s + m.lessons.length, 0);
    const hr = next.reduce((s, m) => s + m.lessons.reduce((ls2, l) => ls2 + (l.duration ?? 0), 0), 0) / 3600;
    setTotalLectures(ls); setTotalHours(Math.round(hr * 10) / 10); setModuleCount(next.length);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Draft restored banner */}
      {!courseId && savedDraft && (draft.hasDraft || savedDraft.title) && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-400">
          <RotateCcw size={14} className="shrink-0" />
          <p className="flex-1">Draft restored from your previous session.</p>
          <button type="button" onClick={() => { draft.clearDraft(); window.location.reload(); }}
            className="text-xs underline underline-offset-2 hover:text-destructive transition-colors">
            Discard
          </button>
        </motion.div>
      )}

      {/* Auto-save indicator */}
      {draft.savedSecsAgo !== null && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Draft saved {draft.savedSecsAgo < 10 ? "just now" : `${draft.savedSecsAgo}s ago`}
        </div>
      )}

      {/* Step indicator */}
      <StepIndicator current={step} errors={stepErrors} onStep={goTo} />

      {/* Two-column: form + preview */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8 items-start">

        {/* Left — step panels */}
        <div className="min-h-[500px]">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={step}
              custom={dir}
              variants={panelVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.18, ease: "easeOut" }}
            >

              {/* ═══ STEP 0 — BASICS ═══════════════════════════════════════ */}
              {step === 0 && (
                <FieldGroup>
                  <SectionHeader icon={BookOpen} title="Basic Information" description="The core details that appear on your course listing" />

                  <FInput label="Course Title" required error={errors.title}
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Full Stack MERN Bootcamp 2025"
                    prefixIcon={<BookOpen size={14} />} />

                  <FInput label="Subtitle" hint="One-line pitch shown on course cards"
                    value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. From zero to deployed in 12 weeks" />

                  <FTextarea label="Short Description" required hint="Shown on listing cards (200–400 chars)" error={errors.desc}
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    rows={3} maxChars={500} placeholder="What makes this course unique?" />

                  <FTextarea label="Full Description" hint="Detailed overview shown on the course detail page"
                    value={longDescription} onChange={(e) => setLongDescription(e.target.value)}
                    rows={5} placeholder="In-depth overview: what students build, tools used, who it's for…" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FSelect label="Category" required error={errors.category}
                      value={category} onChange={setCategory}
                      options={CATEGORY_OPTIONS} placeholder="Select category…" />

                    <FInput label="Duration" required hint='"40 hours" or "3 months"' error={errors.duration}
                      value={duration} onChange={(e) => setDuration(e.target.value)}
                      placeholder="40 hours" prefixIcon={<Clock size={14} />} />
                  </div>

                  {/* Level selector */}
                  <div className="space-y-1.5">
                    <Label className="text-[0.82rem] font-semibold">Difficulty Level</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {LEVELS.map((l) => (
                        <button key={l.value} type="button" onClick={() => setLevel(l.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-150",
                            level === l.value ? l.className : "border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
                          )}>
                          <BarChart2 size={16} />
                          <div>
                            <p className="text-[0.78rem] font-bold">{l.label}</p>
                            <p className="text-[0.62rem] opacity-70">{l.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </FieldGroup>
              )}

              {/* ═══ STEP 1 — PRICING ═══════════════════════════════════════ */}
              {step === 1 && (
                <FieldGroup>
                  <SectionHeader icon={DollarSign} title="Pricing" description="Set the sale price and optional strike-through original price" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FInput label="Sale Price (₹)" required hint="Stored as paise internally"
                      type="number" min="0" value={priceRupees}
                      onChange={(e) => setPriceRupees(e.target.value)}
                      placeholder="4999" prefixIcon={<span className="text-sm font-bold">₹</span>} />

                    <FInput label="Original Price (₹)" hint="Strike-through 'was' price"
                      type="number" min="0" value={origRupees}
                      onChange={(e) => setOrigRupees(e.target.value)}
                      placeholder="9999" prefixIcon={<span className="text-sm font-bold">₹</span>} />
                  </div>

                  {priceRupees && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border bg-card p-4 space-y-2.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Pricing Summary</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">Sale price</span>
                        <span className="text-xl font-black text-foreground">
                          ₹{parseInt(priceRupees, 10).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {origRupees && parseInt(origRupees, 10) > parseInt(priceRupees, 10) && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Was</span>
                            <span className="text-sm text-muted-foreground line-through">₹{parseInt(origRupees, 10).toLocaleString("en-IN")}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-sm font-semibold text-emerald-400">Savings</span>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">
                              {Math.round(((parseInt(origRupees,10) - parseInt(priceRupees,10)) / parseInt(origRupees,10)) * 100)}% OFF
                            </Badge>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  <button type="button" onClick={() => setPriceRupees("")}
                    className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                    Make this course free
                  </button>
                </FieldGroup>
              )}

              {/* ═══ STEP 2 — MEDIA ═════════════════════════════════════════ */}
              {step === 2 && (
                <FieldGroup>
                  <SectionHeader icon={ImageIcon} title="Media & Instructor" description="Thumbnail, preview trailer, and course instructor" />

                  {/* Thumbnail */}
                  <div className="space-y-1.5">
                    <Label className="text-[0.82rem] font-semibold">Course Thumbnail</Label>
                    {thumbnail ? (
                      <div className="group relative overflow-hidden rounded-xl border aspect-video bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
                          <Button type="button" size="sm" variant="secondary"
                            onClick={() => thumbInputRef.current?.click()}>
                            Replace
                          </Button>
                          <Button type="button" size="sm" variant="destructive"
                            onClick={() => setThumbnail("")}>
                            Remove
                          </Button>
                        </div>
                        {thumbUploading && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-3">
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                              <motion.div animate={{ width: `${thumbPct}%` }} className="h-full bg-primary" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button type="button" onClick={() => thumbInputRef.current?.click()}
                        disabled={thumbUploading}
                        className="group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border aspect-video transition-all hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed">
                        {thumbUploading ? (
                          <div className="w-48 space-y-3">
                            <Loader2 size={24} className="mx-auto animate-spin text-primary" />
                            <div className="h-1.5 overflow-hidden rounded-full bg-border">
                              <motion.div animate={{ width: `${thumbPct}%` }}
                                className="h-full bg-gradient-to-r from-primary to-cyan-500" />
                            </div>
                            <p className="text-center text-xs text-muted-foreground">{thumbPct}%</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex size-12 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                              <Upload size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-foreground">Click to upload thumbnail</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, WebP — 16:9 · Cloudflare R2</p>
                            </div>
                          </>
                        )}
                      </button>
                    )}
                    {thumbError && (
                      <p className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle size={11} />{thumbError}
                      </p>
                    )}
                    <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbFile} />
                    <div className="flex items-center gap-2 mt-1">
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground">or paste URL</span>
                      <Separator className="flex-1" />
                    </div>
                    <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)}
                      placeholder="https://cdn.codepath.dev/thumbnails/…" />
                  </div>

                  {/* Preview video */}
                  <div className="space-y-1.5">
                    <Label className="text-[0.82rem] font-semibold">Preview / Trailer Video</Label>
                    <p className="text-xs text-muted-foreground">Free clip shown to unenrolled students</p>
                    <BunnyUploadZone
                      videoId={previewVideoId}
                      onChange={setPreviewVideoId}
                      title={`${title || "Course"} — Preview`}
                    />
                  </div>

                  {/* Instructor */}
                  <div className="space-y-1.5">
                    <Label className="text-[0.82rem] font-semibold">
                      Instructor <span className="text-destructive ml-0.5">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">Search and select the course instructor</p>
                    <InstructorPicker value={instructorId} onChange={setInstructorId} error={errors.instructor} />
                  </div>
                </FieldGroup>
              )}

              {/* ═══ STEP 3 — PUBLISHING ════════════════════════════════════ */}
              {step === 3 && (
                <FieldGroup>
                  <SectionHeader icon={Rocket} title="Publishing" description="Control visibility and card appearance" />

                  {/* Status */}
                  <div className="space-y-1.5">
                    <Label className="text-[0.82rem] font-semibold">Publication Status</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {STATUS_OPTIONS.map((s) => (
                        <button key={s.value} type="button" onClick={() => setStatus(s.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                            status === s.value ? s.className : "border-border text-muted-foreground hover:border-primary/30"
                          )}>
                          <span className="text-sm font-bold">{s.label}</span>
                          <span className="text-[0.62rem] opacity-70">{s.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured toggle */}
                  <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Featured on homepage</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Spotlight on the marketing homepage</p>
                    </div>
                    <Switch
                      checked={featured}
                      onCheckedChange={setFeatured}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  {/* Promo label + accent */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FInput label="Promo Label" hint='"Bestseller", "New", "Hot"'
                      value={tag} onChange={(e) => setTag(e.target.value)}
                      placeholder="Bestseller" prefixIcon={<TagIcon size={13} />} />

                    <div className="space-y-1.5">
                      <Label className="text-[0.82rem] font-semibold">Accent Color</Label>
                      <p className="text-xs text-muted-foreground">Card gradient colour</p>
                      <div className="flex items-center gap-2">
                        <input type="color" value={accentColor || "#7c6fff"}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="size-10 cursor-pointer rounded-lg border border-input bg-transparent p-1 shrink-0" />
                        <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                          placeholder="#7c6fff" className="font-mono text-sm" />
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        {ACCENT_PRESETS.map((hex) => (
                          <button key={hex} type="button" onClick={() => setAccentColor(hex)}
                            title={hex}
                            className={cn(
                              "size-6 rounded-lg border-2 transition-all hover:scale-110",
                              accentColor === hex ? "border-foreground scale-110 shadow-md" : "border-transparent"
                            )}
                            style={{ background: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Gradient presets */}
                  <div className="space-y-1.5">
                    <Label className="text-[0.82rem] font-semibold">Card Gradient</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {GRADIENT_PRESETS.map((g) => (
                        <button key={g.value} type="button" onClick={() => setGradient(g.value)}
                          className={cn(
                            "relative h-12 overflow-hidden rounded-xl border-2 bg-gradient-to-br text-[0.58rem] font-bold text-white transition-all",
                            g.value,
                            gradient === g.value ? "border-foreground scale-[1.03] shadow-lg" : "border-transparent hover:border-white/40"
                          )}>
                          <span className="absolute inset-0 flex items-end p-1.5">{g.label}</span>
                          {gradient === g.value && (
                            <span className="absolute right-1 top-1"><Check size={10} /></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </FieldGroup>
              )}

              {/* ═══ STEP 4 — DETAILS ═══════════════════════════════════════ */}
              {step === 4 && (
                <FieldGroup>
                  <SectionHeader icon={ListChecks} title="Course Details" description="Outcomes, highlights, and stats for the detail page" />

                  {/* Meta stats */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Lectures",  val: totalLectures, set: setTotalLectures, icon: Activity },
                      { label: "Hours",     val: totalHours,    set: setTotalHours,    icon: Clock    },
                      { label: "Modules",   val: moduleCount,   set: setModuleCount,   icon: BookOpen },
                      { label: "Projects",  val: projects,      set: setProjects,      icon: Globe    },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <div key={m.label} className="rounded-xl border bg-card p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Icon size={11} />{m.label}
                          </div>
                          <input
                            type="number" min="0"
                            value={m.val || ""}
                            onChange={(e) => m.set(parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full bg-transparent text-xl font-black text-foreground outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground">Auto-synced from Curriculum — override if needed.</p>

                  <TagInput label="Course Tags" hint="Used for search and filtering (e.g. React, Node.js)" placeholder="Add tag…" items={tags} onChange={setTags} />
                  <TagInput label="Course Highlights" hint="Key selling points on the detail page" placeholder="e.g. 12 real-world projects" items={highlights} onChange={setHighlights} />
                  <TagInput label="What You'll Learn" hint="Learning outcomes section bullets" placeholder="e.g. Build REST APIs with Node.js" items={whatYouLearn} onChange={setWhatYouLearn} />
                  <TagInput label="Prerequisites" hint="Requirements listed before enrollment" placeholder="e.g. Basic JavaScript knowledge" items={prerequisites} onChange={setPrerequisites} />
                </FieldGroup>
              )}

              {/* ═══ STEP 5 — CURRICULUM ════════════════════════════════════ */}
              {step === 5 && (
                <FieldGroup>
                  <SectionHeader icon={Layers} title="Curriculum" description="Build modules and lessons — drag to reorder" />

                  {curriculum.length === 0 && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                        <Layers size={14} /> How to build your curriculum
                      </p>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        {[
                          ["Add Module", 'Create a section e.g. "Introduction"'],
                          ["Add Lesson", "Each lesson gets its own video upload"],
                          ["Upload video", 'Click "Upload video" on the lesson row → Bunny Stream'],
                          ["Drag to reorder", "Use the ⠿ handle to reorder modules or lessons"],
                        ].map(([b, rest], i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[0.65rem] font-black text-primary-foreground mt-0.5">
                              {i + 1}
                            </span>
                            <span>Click <strong className="text-foreground">"{b}"</strong> — {rest}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <CurriculumBuilder courseId={courseId ?? ""} value={curriculum} onChange={handleCurriculumChange} />
                </FieldGroup>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation footer */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Button type="button" variant="outline" onClick={prev} disabled={step === 0}
              className="gap-2 disabled:opacity-40">
              <ChevronLeft size={15} /> Back
            </Button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                Step {step + 1} of {STEPS.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSaveDraft}
                disabled={savingDraft || saving}
                className="gap-1.5 text-muted-foreground hover:text-amber-400"
              >
                {savingDraft ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save Draft
              </Button>
            </div>

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} className="gap-2">
                Continue <ChevronRight size={15} />
              </Button>
            ) : (
              <Button type="submit" disabled={saving} className="min-w-[140px] gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {saving ? "Saving…" : submitLabel}
              </Button>
            )}
          </div>
        </div>

        {/* Right — live preview (hidden on curriculum step) */}
        {step < 5 && (
          <div className="hidden xl:block">
            <PreviewCard
              title={title} subtitle={subtitle} thumbnail={thumbnail}
              category={category} level={level} priceRupees={priceRupees}
              origRupees={origRupees} tag={tag} accentColor={accentColor}
              gradient={gradient} status={status} featured={featured}
              duration={duration} tags={tags}
            />
          </div>
        )}
      </div>
    </form>
  );
}
