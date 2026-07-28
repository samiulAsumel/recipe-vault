"use client";

import { useState } from "react";
import { login, AdminApiError } from "@/lib/admin/client";
import { TextField } from "./ui/FormControls";

interface AdminLoginProps {
  onSuccess: (mustChangePassword: boolean) => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps): React.JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(username, password);
      onSuccess(result.mustChangePassword);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Login failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-24">
      <div>
        <h1 className="font-display text-3xl text-ink">Admin</h1>
        <p className="mt-1 font-body text-sm text-ink/60">Sign in to manage recipes.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField label="Username" value={username} onChange={setUsername} />
        <label className="flex flex-col gap-1">
          <span className="font-meta text-xs uppercase tracking-wide text-ink/60">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-clay-line bg-parchment px-3 py-2 font-body text-sm text-ink focus-visible:outline-2 focus-visible:outline-turmeric"
          />
        </label>
        {error && <p className="font-body text-sm text-paprika">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="bg-turmeric px-4 py-2 font-body text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
