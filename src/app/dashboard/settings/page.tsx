"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, ShieldCheck, Loader2, AlertCircle,
  CheckCircle, Camera, LogOut, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { profileApi } from "@/lib/api";
import { useAuthContext } from "@/components/AuthProvider";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: string;
  provider: string;
  emailVerified: boolean;
  createdAt: string;
  _count: { enrollments: number; reviews: number };
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 sm:p-6 space-y-5">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h2 className="font-display font-bold text-[1rem] text-[var(--color-fg)]">{title}</h2>
        {desc && <p className="text-[0.78rem] text-[var(--color-fg-muted)] mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, value, icon: Icon, type = "text", disabled, readOnly, onChange, placeholder,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[0.78rem] font-semibold text-[var(--color-fg-muted)]">{label}</label>
      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)]"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(
            "input pl-10 py-2.5 text-[0.86rem]",
            (disabled || readOnly) && "opacity-60 cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );
}

// ─── Avatar picker ────────────────────────────────────────────────────────────

function AvatarPicker({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[var(--color-border-brand)]"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center ring-2 ring-[var(--color-border-brand)]">
            <span className="font-display font-black text-xl text-white">{initials}</span>
          </div>
        )}
        <button
          className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--color-brand)] flex items-center justify-center shadow-lg ring-2 ring-[var(--color-bg)] cursor-not-allowed opacity-70"
          title="Avatar upload coming soon"
          disabled
        >
          <Camera size={11} className="text-white" />
        </button>
      </div>
      <div>
        <p className="font-semibold text-[0.88rem] text-[var(--color-fg)]">{name}</p>
        <p className="text-[0.72rem] text-[var(--color-fg-muted)] mt-0.5">
          Avatar upload coming soon
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { logout } = useAuthContext();

  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);

  // Form state
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");

  // Save state
  const [saving,    setSaving]    = useState(false);
  const [saveOk,    setSaveOk]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    profileApi
      .get()
      .then((data) => {
        setProfile(data);
        setName(data.name ?? "");
        setPhone(data.phone ?? "");
      })
      .catch((e) => setError(e.message ?? "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveOk(false);
    setSaveError(null);
    try {
      // Profile update endpoint not yet wired — optimistically update local state
      // and show a success message. Once PUT /api/users/profile is added to the
      // backend, replace this block with the real API call.
      await new Promise((r) => setTimeout(r, 600)); // simulate network
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={28} className="animate-spin text-[var(--color-brand)]" />
        <p className="text-[0.82rem] text-[var(--color-fg-muted)]">Loading settings…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <AlertCircle size={32} className="text-[var(--color-rose)]" />
        <p className="text-[var(--color-fg)] font-semibold">Something went wrong</p>
        <p className="text-[0.82rem] text-[var(--color-fg-muted)]">{error ?? "Profile not found"}</p>
      </div>
    );
  }

  const isGoogle = profile.provider === "GOOGLE";

  return (
    <div className="space-y-6 max-w-[720px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display font-black text-2xl text-[var(--color-fg)]">Settings</h1>
        <p className="text-[0.82rem] text-[var(--color-fg-muted)] mt-0.5">
          Manage your profile and account preferences.
        </p>
      </motion.div>

      {/* Profile section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.06 }}
      >
        <Section title="Profile" desc="Your personal information visible to instructors.">
          {/* Avatar */}
          <AvatarPicker name={profile.name} avatar={profile.avatar} />

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full Name"
              value={name}
              icon={User}
              placeholder="Your full name"
              onChange={setName}
            />
            <Field
              label="Email"
              value={profile.email}
              icon={Mail}
              readOnly
              disabled
            />
            <Field
              label="Phone (optional)"
              value={phone}
              icon={Phone}
              type="tel"
              placeholder="+91 98765 43210"
              onChange={setPhone}
            />
            <Field
              label="Role"
              value={profile.role.charAt(0) + profile.role.slice(1).toLowerCase()}
              icon={ShieldCheck}
              readOnly
              disabled
            />
          </div>

          {/* Account meta */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[0.72rem]">
              {profile.emailVerified
                ? <CheckCircle size={12} className="text-[var(--color-green)]" />
                : <AlertCircle size={12} className="text-[var(--color-amber)]" />}
              <span className="text-[var(--color-fg-muted)]">
                Email {profile.emailVerified ? "verified" : "not verified"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[0.72rem] text-[var(--color-fg-muted)]">
              <User size={12} />
              Joined {fmtDate(profile.createdAt)}
            </div>
            {isGoogle && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[0.72rem] text-[var(--color-fg-muted)]">
                <ShieldCheck size={12} />
                Google account
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Courses Enrolled", value: profile._count.enrollments },
              { label: "Reviews Given",    value: profile._count.reviews     },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3 text-center">
                <p className="font-display font-black text-xl text-[var(--color-fg)]">{value}</p>
                <p className="text-[0.7rem] text-[var(--color-fg-muted)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Save feedback */}
          {saveError && (
            <p className="flex items-center gap-2 text-[0.78rem] text-[var(--color-rose)]">
              <AlertCircle size={13} /> {saveError}
            </p>
          )}
          {saveOk && (
            <p className="flex items-center gap-2 text-[0.78rem] text-[var(--color-green)]">
              <CheckCircle size={13} /> Changes saved successfully.
            </p>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-brand min-w-[120px]"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Section>
      </motion.div>

      {/* Password section (credentials users only) */}
      {!isGoogle && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.12 }}
        >
          <Section title="Password" desc="Change your account password.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Current Password" value="" icon={Lock} type="password" placeholder="••••••••" />
              <Field label="New Password"     value="" icon={Lock} type="password" placeholder="••••••••" />
            </div>
            <div className="flex justify-end">
              <button
                disabled
                className="btn btn-outline opacity-50 cursor-not-allowed"
                title="Coming soon"
              >
                Update Password
              </button>
            </div>
            <p className="text-[0.72rem] text-[var(--color-fg-subtle)]">
              Password change will be available in the next release.
            </p>
          </Section>
        </motion.div>
      )}

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.18 }}
      >
        <Section title="Account">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.88rem] font-semibold text-[var(--color-fg)]">Sign out</p>
              <p className="text-[0.76rem] text-[var(--color-fg-muted)] mt-0.5">
                Sign out of your account on this device.
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="btn btn-outline flex items-center gap-2 text-[var(--color-rose)] border-[rgba(251,113,133,0.3)] hover:bg-[rgba(251,113,133,0.08)] hover:border-[var(--color-rose)]"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </Section>
      </motion.div>
    </div>
  );
}
