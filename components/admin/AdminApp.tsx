"use client";

import { useEffect, useState } from "react";
import { fetchSession } from "@/lib/admin/client";
import { getStoredSession } from "@/lib/admin/session";
import { AdminLogin } from "./AdminLogin";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { AdminShell } from "./AdminShell";

type AdminState = "loading" | "loggedOut" | "forcedPasswordChange" | "loggedIn";

export function AdminApp(): React.JSX.Element {
  const [state, setState] = useState<AdminState>(() => (getStoredSession() ? "loading" : "loggedOut"));

  useEffect(() => {
    if (state !== "loading") return;
    fetchSession()
      .then((session) => setState(session.mustChangePassword ? "forcedPasswordChange" : "loggedIn"))
      .catch(() => setState("loggedOut"));
  }, [state]);

  if (state === "loading") {
    return (
      <main className="mx-auto max-w-5xl px-6 py-24">
        <p className="font-meta text-sm text-ink/50">Loading…</p>
      </main>
    );
  }

  if (state === "loggedOut") {
    return (
      <AdminLogin
        onSuccess={(mustChangePassword) => setState(mustChangePassword ? "forcedPasswordChange" : "loggedIn")}
      />
    );
  }

  if (state === "forcedPasswordChange") {
    return <PasswordChangeForm forced onSuccess={() => setState("loggedIn")} />;
  }

  return <AdminShell onLogout={() => setState("loggedOut")} />;
}
