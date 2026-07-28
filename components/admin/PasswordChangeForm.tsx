"use client";

import { useState } from "react";
import { changePassword, AdminApiError } from "@/lib/admin/client";

interface PasswordChangeFormProps {
  /** True for the full-screen forced-change gate; false embedded in Settings. */
  forced?: boolean;
  onSuccess?: () => void;
}

const passwordInputClass =
  "border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric";

export function PasswordChangeForm({ forced = false, onSuccess }: PasswordChangeFormProps): React.JSX.Element {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (newPassword.length < 12) {
      setError("New password must be at least 12 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must differ from the current password.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (forced) onSuccess?.();
      else setNotice("Password updated.");
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Could not change password.");
    } finally {
      setSubmitting(false);
    }
  };

  const form = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-meta text-xs uppercase tracking-wide text-ink/60">Current password</span>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={passwordInputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-meta text-xs uppercase tracking-wide text-ink/60">New password</span>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={passwordInputClass}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-meta text-xs uppercase tracking-wide text-ink/60">Confirm new password</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={passwordInputClass}
        />
      </label>
      {error && <p className="font-body text-sm text-paprika">{error}</p>}
      {notice && <p className="font-body text-sm text-cardamom">{notice}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-turmeric px-4 py-2 font-body text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {submitting ? "Saving…" : "Change password"}
      </button>
    </form>
  );

  if (!forced) return form;

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-24">
      <div>
        <h1 className="font-display text-3xl text-ink">Change your password</h1>
        <p className="mt-1 font-body text-sm text-ink/60">
          You&apos;re signed in with the default password. Set a new one before continuing.
        </p>
      </div>
      {form}
    </main>
  );
}
