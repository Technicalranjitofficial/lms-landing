"use client";

/**
 * CurriculumBuilder
 * ─────────────────
 * Full drag-and-drop curriculum editor for the admin course form.
 *
 * Structure:
 *   Course
 *   └── Module[]  (drag to reorder)
 *       └── Lesson[]  (drag to reorder within module)
 *           ├── Title, description, isFree toggle
 *           ├── Video upload → Bunny Stream (TUS, progress bar)
 *           └── Resources[]  (PDFs / docs / links → Cloudflare R2)
 *
 * Drag-to-reorder uses the HTML5 Drag & Drop API (no extra lib needed).
 * Upload progress uses the useUpload hooks (XHR-based, real %).
 *
 * The component is fully controlled — parent passes `value` and `onChange`.
 * Only IDs / URLs are stored; actual uploads happen here before save.
 */

import { useState, useRef, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, Plus, Trash2, ChevronDown, ChevronUp,
  Video, FileText, Link as LinkIcon, Upload, X,
  CheckCircle2, Loader2, Play, Eye, EyeOff,
  FilePlus, AlertCircle, Clock, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createBunnyVideo, deleteBunnyVideo } from "@/lib/uploads/bunny";
import { getDocumentUploadUrl } from "@/lib/uploads/r2";
import { uploadToBunny, uploadToR2, formatBytes } from "@/hooks/useUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CourseResource {
  id:    string;
  title: string;
  type:  "PDF" | "DOC" | "LINK" | "ZIP" | "OTHER";
  url:   string;   // R2 public URL or external link
}

export interface CourseLesson {
  id:          string;
  title:       string;
  description: string;
  position:    number;
  videoId:     string;   // Bunny GUID (empty until uploaded)
  duration:    number;   // seconds (0 until known)
  isFree:      boolean;
  resources:   CourseResource[];
  // transient upload state (not saved to DB)
  _uploading?:  boolean;
  _uploadPct?:  number;
  _uploadError?: string;
  _videoStatus?: number;  // 0=queued 3=done 5=failed
}

export interface CourseModule {
  id:          string;
  title:       string;
  description: string;
  position:    number;
  lessons:     CourseLesson[];
  _open?:      boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function totalLessons(modules: CourseModule[]): number {
  return modules.reduce((s, m) => s + m.lessons.length, 0);
}

function totalDuration(modules: CourseModule[]): number {
  return modules.reduce((s, m) =>
    s + m.lessons.reduce((ls, l) => ls + (l.duration ?? 0), 0), 0);
}

function fmtDuration(sec: number): string {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const RESOURCE_EXTS: Record<string, CourseResource["type"]> = {
  pdf: "PDF", doc: "DOC", docx: "DOC", ppt: "DOC", pptx: "DOC",
  zip: "ZIP", rar: "ZIP",
};

function guessResourceType(filename: string): CourseResource["type"] {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return RESOURCE_EXTS[ext] ?? "OTHER";
}

// ─── UploadProgressBar ────────────────────────────────────────────────────────

function ProgressBar({ pct, error }: { pct: number; error?: string }) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-[0.72rem] text-[var(--color-rose)]">
        <AlertCircle size={12} />
        <span className="truncate">{error}</span>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[0.68rem] text-[var(--color-fg-muted)]">
        <span className="flex items-center gap-1">
          <Loader2 size={10} className="animate-spin" />
          Uploading…
        </span>
        <span className="font-semibold text-[var(--color-brand-light)]">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3 }}
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-cyan)]"
        />
      </div>
    </div>
  );
}

// ─── ResourceRow ──────────────────────────────────────────────────────────────

function ResourceRow({
  resource, onDelete,
}: {
  resource: CourseResource;
  onDelete: () => void;
}) {
  const Icon = resource.type === "PDF"  ? FileText
             : resource.type === "DOC"  ? FileText
             : resource.type === "ZIP"  ? FilePlus
             : resource.type === "LINK" ? LinkIcon
             : FileText;

  const color = resource.type === "PDF"  ? "text-[var(--color-rose)]"
              : resource.type === "DOC"  ? "text-[var(--color-brand-light)]"
              : resource.type === "ZIP"  ? "text-[var(--color-amber)]"
              : resource.type === "LINK" ? "text-[var(--color-cyan)]"
              : "text-[var(--color-fg-muted)]";

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] group">
      <Icon size={13} className={cn("shrink-0", color)} />
      <a
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="flex-1 text-[0.76rem] text-[var(--color-fg)] truncate hover:text-[var(--color-brand-light)] transition-colors"
      >
        {resource.title}
      </a>
      <span className="text-[0.62rem] font-bold uppercase text-[var(--color-fg-subtle)] bg-[var(--color-surface-3)] px-1.5 py-0.5 rounded-md">
        {resource.type}
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded-md opacity-0 group-hover:opacity-100 text-[var(--color-fg-muted)] hover:text-[var(--color-rose)] transition-all"
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─── LessonRow ────────────────────────────────────────────────────────────────

interface LessonRowProps {
  lesson:     CourseLesson;
  courseId:   string;
  moduleId:   string;
  dragHandle: React.ReactNode;
  onChange:   (updated: Partial<CourseLesson>) => void;
  onDelete:   () => void;
}

function LessonRow({ lesson, courseId, moduleId, dragHandle, onChange, onDelete }: LessonRowProps) {
  // Start expanded so the video upload zone is immediately visible
  const [expanded, setExpanded]   = useState(true);
  const [linkUrl,  setLinkUrl]    = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef   = useRef<HTMLInputElement>(null);

  // ── Video upload ─────────────────────────────────────────────────────────
  async function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (lesson.videoId) {
      try { await deleteBunnyVideo(lesson.videoId); } catch {}
    }

    onChange({ _uploading: true, _uploadPct: 0, _uploadError: undefined, videoId: "" });

    try {
      // Server creates video + generates presigned credentials (API key stays server-side)
      const credentials = await createBunnyVideo(
        lesson.title || `Lesson ${lesson.position}`
      );

      onChange({ videoId: credentials.videoId, _uploadPct: 0 });

      // Browser uploads directly to Bunny via tus-js-client with presigned auth
      await uploadToBunny(file, {
        videoId:    credentials.videoId,
        libraryId:  credentials.libraryId,
        signature:  credentials.signature,
        expiration: credentials.expiration,
        title:      lesson.title || `Lesson ${lesson.position}`,
        onProgress: (pct) => onChange({ _uploadPct: pct }),
        onError:    (msg) => onChange({ _uploadError: msg, _uploading: false }),
      });

      onChange({ _uploading: false, _uploadPct: 100, _videoStatus: 1 });
    } catch (err: unknown) {
      onChange({ _uploading: false, _uploadError: (err as Error).message ?? "Upload failed" });
    }
  }

  // ── Document upload ──────────────────────────────────────────────────────
  async function handleDocSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const tempId = uid();
    const tempResource: CourseResource = {
      id:    tempId,
      title: file.name,
      type:  guessResourceType(file.name),
      url:   "__uploading__",
    };
    onChange({ resources: [...lesson.resources, tempResource] });

    try {
      const { uploadUrl, publicUrl } = await getDocumentUploadUrl(
        courseId || "draft",
        lesson.id,
        file.name
      );

      await uploadToR2(uploadUrl, file, file.type || "application/octet-stream", {
        onProgress: (pct) => {
          // Could show per-resource progress — keeping it simple for now
          void pct;
        },
      });

      onChange({
        resources: lesson.resources
          .filter((r) => r.id !== tempId)
          .concat({ id: uid(), title: file.name, type: guessResourceType(file.name), url: publicUrl }),
      });
    } catch (err: unknown) {
      onChange({ resources: lesson.resources.filter((r) => r.id !== tempId) });
      alert((err as Error).message ?? "Document upload failed");
    }
  }

  // ── Add external link ────────────────────────────────────────────────────
  function addLink() {
    if (!linkUrl.trim()) return;
    onChange({
      resources: [...lesson.resources, {
        id: uid(), title: linkTitle || linkUrl, type: "LINK", url: linkUrl,
      }],
    });
    setLinkUrl("");
    setLinkTitle("");
  }

  const hasVideo = !!lesson.videoId && !lesson._uploading && lesson._uploadPct === 100;

  return (
    <div className={cn(
      "rounded-2xl border transition-all duration-150",
      expanded
        ? "border-[var(--color-border-brand)] bg-[var(--color-surface)]"
        : "border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-2)]"
    )}>
      {/* Lesson header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {dragHandle}

        {/* Free / Locked toggle */}
        <button
          type="button"
          onClick={() => onChange({ isFree: !lesson.isFree })}
          title={lesson.isFree ? "Preview — visible to all" : "Locked — enrolled only"}
          className={cn(
            "p-1.5 rounded-lg transition-colors shrink-0",
            lesson.isFree
              ? "text-[var(--color-cyan)] bg-[var(--color-cyan-dim)]"
              : "text-[var(--color-fg-subtle)] hover:bg-[var(--color-surface-3)]"
          )}
        >
          {lesson.isFree ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>

        {/* Title input */}
        <input
          value={lesson.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={`Lesson ${lesson.position} title…`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-transparent text-[0.83rem] font-medium text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] outline-none border-none"
        />

        {/* Duration badge */}
        {lesson.duration > 0 && (
          <span className="text-[0.68rem] text-[var(--color-fg-subtle)] flex items-center gap-1 shrink-0">
            <Clock size={10} />
            {fmtDuration(lesson.duration)}
          </span>
        )}

        {/* Video chip — always visible; click to upload or shows status */}
        {lesson._uploading ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-brand-dim)] shrink-0">
            <Loader2 size={11} className="animate-spin text-[var(--color-brand)]" />
            <span className="text-[0.67rem] font-semibold text-[var(--color-brand-light)]">
              {lesson._uploadPct ?? 0}%
            </span>
          </div>
        ) : hasVideo ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[rgba(52,211,153,0.12)] shrink-0">
            <CheckCircle2 size={11} className="text-[var(--color-green)]" />
            <span className="text-[0.67rem] font-semibold text-[var(--color-green)]">Video ready</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}
            disabled={lesson._uploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-dashed border-[var(--color-border-2)] text-[0.7rem] font-semibold text-[var(--color-fg-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-light)] hover:bg-[var(--color-brand-dim)] transition-all shrink-0"
          >
            <Video size={12} />
            Upload video
          </button>
        )}

        {/* Expand / collapse */}
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="p-1.5 rounded-lg text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-3)] transition-colors shrink-0"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg text-[var(--color-fg-subtle)] hover:text-[var(--color-rose)] hover:bg-[rgba(251,113,133,0.1)] transition-colors shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Upload progress */}
      {(lesson._uploading || lesson._uploadError) && (
        <div className="px-4 pb-2">
          <ProgressBar pct={lesson._uploadPct ?? 0} error={lesson._uploadError} />
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-border)] pt-3">

              {/* Description */}
              <div>
                <label className="text-[0.74rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide block mb-1.5">
                  Lesson Description
                </label>
                <textarea
                  value={lesson.description}
                  onChange={(e) => onChange({ description: e.target.value })}
                  rows={2}
                  placeholder="Optional — brief description of what this lesson covers"
                  className="input resize-none text-sm"
                />
              </div>

              {/* Duration override */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[0.74rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide block mb-1.5">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lesson.duration || ""}
                    onChange={(e) => onChange({ duration: parseInt(e.target.value, 10) || 0 })}
                    placeholder="e.g. 3600 = 1 hour"
                    className="input text-sm"
                  />
                </div>
              </div>

              {/* Video upload */}
              <div>
                <label className="text-[0.74rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide block mb-2">
                  Video
                </label>

                {hasVideo ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-green)]/30 bg-[rgba(52,211,153,0.06)]">
                    <div className="w-9 h-9 rounded-xl bg-[rgba(52,211,153,0.12)] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-[var(--color-green)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.78rem] font-semibold text-[var(--color-fg)]">Video uploaded</p>
                      <p className="text-[0.68rem] text-[var(--color-fg-muted)] font-mono truncate">{lesson.videoId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="text-[0.72rem] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] underline underline-offset-2 shrink-0"
                    >
                      Replace
                    </button>
                  </div>
                ) : lesson._uploading ? (
                  /* ── Active upload progress ── */
                  <div className="w-full rounded-2xl border-2 border-[var(--color-brand)]/30 bg-[var(--color-brand-dim)] p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="flex items-center gap-2 text-[var(--color-brand-light)]">
                        <Loader2 size={14} className="animate-spin" />
                        {lesson._uploadPct === 0
                          ? "Preparing upload…"
                          : lesson.videoId
                          ? "Uploading to Bunny Stream…"
                          : "Creating video…"}
                      </span>
                      <span className="font-bold text-[var(--color-brand-light)]">
                        {lesson._uploadPct ?? 0}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                      <motion.div
                        animate={{ width: `${lesson._uploadPct ?? 0}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-cyan)]"
                      />
                    </div>
                    <p className="text-[0.68rem] text-[var(--color-fg-muted)]">
                      Do not close this page — upload in progress
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2.5 py-5 rounded-2xl border-2 border-dashed border-[var(--color-border-2)] hover:border-[var(--color-border-brand)] hover:bg-[var(--color-brand-dim)] cursor-pointer transition-colors"
                  >
                    <Video size={18} className="text-[var(--color-fg-muted)]" />
                    <div className="text-left">
                      <p className="text-[0.8rem] font-semibold text-[var(--color-fg)]">Upload video</p>
                      <p className="text-[0.68rem] text-[var(--color-fg-muted)]">MP4, MKV, MOV — uploads directly to Bunny Stream</p>
                    </div>
                  </button>
                )}

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoSelect}
                />
              </div>

              {/* Resources */}
              <div>
                <label className="text-[0.74rem] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wide block mb-2">
                  Resources & Downloads
                </label>

                {lesson.resources.length > 0 && (
                  <div className="space-y-1.5 mb-2.5">
                    {lesson.resources.map((r) => (
                      r.url === "__uploading__" ? (
                        <div key={r.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                          <Loader2 size={12} className="animate-spin text-[var(--color-brand)]" />
                          <span className="text-[0.74rem] text-[var(--color-fg-muted)] truncate">{r.title}</span>
                        </div>
                      ) : (
                        <ResourceRow
                          key={r.id}
                          resource={r}
                          onDelete={() => onChange({ resources: lesson.resources.filter((x) => x.id !== r.id) })}
                        />
                      )
                    ))}
                  </div>
                )}

                {/* Add file */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-[var(--color-border-2)] text-[0.74rem] text-[var(--color-fg-muted)] hover:border-[var(--color-border-brand)] hover:text-[var(--color-brand-light)] hover:bg-[var(--color-brand-dim)] transition-all"
                  >
                    <Upload size={12} />
                    Upload file
                  </button>

                  {/* Add link inline */}
                  <div className="flex gap-1.5 flex-1 min-w-0">
                    <input
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="Link title"
                      className="input py-2 text-[0.74rem] w-28"
                    />
                    <input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                      placeholder="https://…"
                      className="input py-2 text-[0.74rem] flex-1"
                    />
                    <button
                      type="button"
                      onClick={addLink}
                      disabled={!linkUrl.trim()}
                      className="p-2 rounded-xl border border-[var(--color-border-2)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-brand)] hover:text-[var(--color-brand-light)] disabled:opacity-30 transition-all"
                    >
                      <LinkIcon size={13} />
                    </button>
                  </div>
                </div>

                <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar" className="hidden" onChange={handleDocSelect} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ModuleCard ───────────────────────────────────────────────────────────────

interface ModuleCardProps {
  mod:      CourseModule;
  index:    number;
  courseId: string;
  onChange: (updated: Partial<CourseModule>) => void;
  onDelete: () => void;
  // drag
  dragging:      boolean;
  onDragStart:   () => void;
  onDragEnd:     () => void;
  onDragOver:    (e: React.DragEvent) => void;
  onDrop:        () => void;
}

function ModuleCard({
  mod, index, courseId, onChange, onDelete,
  dragging, onDragStart, onDragEnd, onDragOver, onDrop,
}: ModuleCardProps) {
  const [lessonDrag, setLessonDrag] = useState<number | null>(null);
  const [lessonOver, setLessonOver] = useState<number | null>(null);

  function updateLesson(lessonIdx: number, patch: Partial<CourseLesson>) {
    const next = [...mod.lessons];
    next[lessonIdx] = { ...next[lessonIdx], ...patch };
    onChange({ lessons: next });
  }

  function addLesson() {
    const pos = mod.lessons.length + 1;
    onChange({
      lessons: [
        ...mod.lessons,
        { id: uid(), title: "", description: "", position: pos, videoId: "",
          duration: 0, isFree: false, resources: [] },
      ],
    });
  }

  function deleteLesson(lessonIdx: number) {
    onChange({ lessons: mod.lessons.filter((_, i) => i !== lessonIdx) });
  }

  // ── Lesson drag-to-reorder ────────────────────────────────────────────────
  function handleLessonDragStart(idx: number) { setLessonDrag(idx); }
  function handleLessonDragEnd()               { setLessonDrag(null); setLessonOver(null); }
  function handleLessonDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setLessonOver(idx);
  }
  function handleLessonDrop(targetIdx: number) {
    if (lessonDrag === null || lessonDrag === targetIdx) {
      setLessonDrag(null); setLessonOver(null); return;
    }
    const next = [...mod.lessons];
    const [moved] = next.splice(lessonDrag, 1);
    next.splice(targetIdx, 0, moved);
    onChange({ lessons: next.map((l, i) => ({ ...l, position: i + 1 })) });
    setLessonDrag(null);
    setLessonOver(null);
  }

  const lessonCount = mod.lessons.length;
  const videosReady = mod.lessons.filter((l) => !!l.videoId).length;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      className={cn(
        "rounded-2xl border transition-all duration-200",
        dragging
          ? "opacity-50 scale-[0.98] border-[var(--color-border-brand)]"
          : "border-[var(--color-border-2)] bg-[var(--color-surface)]"
      )}
    >
      {/* Module header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        {/* Drag handle */}
        <GripVertical size={16} className="text-[var(--color-fg-subtle)] cursor-grab active:cursor-grabbing shrink-0" />

        {/* Module number */}
        <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-dim)] flex items-center justify-center shrink-0">
          <span className="text-[0.68rem] font-black text-[var(--color-brand-light)]">{index + 1}</span>
        </div>

        {/* Title */}
        <input
          value={mod.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={`Module ${index + 1} — e.g. "Data Structures Fundamentals"`}
          className="flex-1 bg-transparent text-[0.88rem] font-bold text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] outline-none border-none"
        />

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3 text-[0.68rem] text-[var(--color-fg-subtle)] shrink-0">
          <span className="flex items-center gap-1">
            <Play size={10} /> {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
          </span>
          {lessonCount > 0 && (
            <span className={cn(
              "flex items-center gap-1",
              videosReady === lessonCount ? "text-[var(--color-green)]" : "text-[var(--color-fg-subtle)]"
            )}>
              <Video size={10} /> {videosReady}/{lessonCount}
            </span>
          )}
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => onChange({ _open: !mod._open })}
          className="p-1.5 rounded-lg text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-3)] transition-colors"
        >
          {mod._open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Delete module */}
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg text-[var(--color-fg-subtle)] hover:text-[var(--color-rose)] hover:bg-[rgba(251,113,133,0.1)] transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Module description + lessons */}
      <AnimatePresence>
        {mod._open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              {/* Module description */}
              <input
                value={mod.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Module description (optional)"
                className="input text-sm py-2"
              />

              {/* Lessons */}
              <div className="space-y-2">
                {mod.lessons.map((lesson, lIdx) => (
                  <div
                    key={lesson.id}
                    draggable
                    onDragStart={(e) => { e.stopPropagation(); handleLessonDragStart(lIdx); }}
                    onDragEnd={(e)   => { e.stopPropagation(); handleLessonDragEnd(); }}
                    onDragOver={(e)  => { e.stopPropagation(); handleLessonDragOver(e, lIdx); }}
                    onDrop={(e)      => { e.stopPropagation(); e.preventDefault(); handleLessonDrop(lIdx); }}
                    className={cn(
                      "transition-all duration-150",
                      lessonDrag === lIdx && "opacity-50 scale-[0.98]",
                      lessonOver === lIdx && lessonDrag !== lIdx && "ring-2 ring-[var(--color-brand)]/40 rounded-2xl"
                    )}
                  >
                    <LessonRow
                      lesson={lesson}
                      courseId={courseId}
                      moduleId={mod.id}
                      dragHandle={
                        <GripVertical
                          size={14}
                          className="text-[var(--color-fg-subtle)] cursor-grab active:cursor-grabbing shrink-0"
                        />
                      }
                      onChange={(patch) => updateLesson(lIdx, patch)}
                      onDelete={() => deleteLesson(lIdx)}
                    />
                  </div>
                ))}
              </div>

              {/* Add lesson */}
              <button
                type="button"
                onClick={addLesson}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--color-border-2)] text-[0.78rem] font-medium text-[var(--color-fg-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-light)] hover:bg-[var(--color-brand-dim)] transition-all"
              >
                <Plus size={14} />
                Add Lesson
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CurriculumBuilder (main export) ─────────────────────────────────────────

export interface CurriculumBuilderProps {
  courseId: string;
  value:    CourseModule[];
  onChange: (next: CourseModule[]) => void;
}

export function CurriculumBuilder({ courseId, value, onChange }: CurriculumBuilderProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  function addModule() {
    onChange([
      ...value,
      {
        id: uid(), title: "", description: "",
        position: value.length + 1,
        lessons: [], _open: true,
      },
    ]);
  }

  function updateModule(idx: number, patch: Partial<CourseModule>) {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }

  function deleteModule(idx: number) {
    onChange(value.filter((_, i) => i !== idx).map((m, i) => ({ ...m, position: i + 1 })));
  }

  // Module drag-to-reorder
  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDragEnd()               { setDragIdx(null); setOverIdx(null); }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setOverIdx(idx);
  }
  function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null); setOverIdx(null); return;
    }
    const next = [...value];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next.map((m, i) => ({ ...m, position: i + 1 })));
    setDragIdx(null);
    setOverIdx(null);
  }

  const lessons = totalLessons(value);
  const dur     = totalDuration(value);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {value.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[0.74rem] text-[var(--color-fg-muted)]">
          <span className="flex items-center gap-1.5">
            <BookOpen size={12} className="text-[var(--color-brand)]" />
            <strong className="text-[var(--color-fg)]">{value.length}</strong> modules
          </span>
          <span className="flex items-center gap-1.5">
            <Play size={12} className="text-[var(--color-brand)]" />
            <strong className="text-[var(--color-fg)]">{lessons}</strong> lessons
          </span>
          {dur > 0 && (
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-[var(--color-brand)]" />
              <strong className="text-[var(--color-fg)]">{fmtDuration(dur)}</strong> total
            </span>
          )}
          <span className="ml-auto text-[0.68rem] text-[var(--color-fg-subtle)]">
            Drag modules to reorder
          </span>
        </div>
      )}

      {/* Module list */}
      <div className="space-y-3">
        {value.map((mod, idx) => (
          <div
            key={mod.id}
            className={cn(
              "transition-all duration-150",
              overIdx === idx && dragIdx !== idx && "ring-2 ring-[var(--color-brand)]/40 rounded-2xl"
            )}
          >
            <ModuleCard
              mod={mod}
              index={idx}
              courseId={courseId}
              onChange={(patch) => updateModule(idx, patch)}
              onDelete={() => deleteModule(idx)}
              dragging={dragIdx === idx}
              onDragStart={() => handleDragStart(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={() => handleDrop(idx)}
            />
          </div>
        ))}
      </div>

      {/* Add module */}
      <button
        type="button"
        onClick={addModule}
        className={cn(
          "w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-dashed transition-all duration-150",
          "border-[var(--color-border-2)] text-[var(--color-fg-muted)]",
          "hover:border-[var(--color-brand)] hover:text-[var(--color-brand-light)] hover:bg-[var(--color-brand-dim)]"
        )}
      >
        <div className="w-7 h-7 rounded-xl bg-[var(--color-surface-3)] flex items-center justify-center">
          <Plus size={14} />
        </div>
        <span className="text-[0.82rem] font-semibold">Add Module</span>
      </button>
    </div>
  );
}
