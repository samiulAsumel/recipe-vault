"use client";

import { useState } from "react";
import { logout } from "@/lib/admin/client";
import { RecipeList } from "./RecipeList";
import { PasswordChangeForm } from "./PasswordChangeForm";

type Tab = "recipes" | "settings";

interface AdminShellProps {
  onLogout: () => void;
}

export function AdminShell({ onLogout }: AdminShellProps): React.JSX.Element {
  const [tab, setTab] = useState<Tab>("recipes");

  const handleLogout = (): void => {
    logout();
    onLogout();
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between border-b border-clay-line pb-4">
        <h1 className="font-display text-3xl text-ink">Admin</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="font-meta text-xs text-paprika hover:underline focus-visible:outline-2 focus-visible:outline-turmeric"
        >
          Log out
        </button>
      </div>
      <nav className="mt-6 flex gap-2 border-b border-clay-line">
        <TabButton active={tab === "recipes"} onClick={() => setTab("recipes")}>
          Manage Recipes
        </TabButton>
        <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>
          Settings
        </TabButton>
      </nav>
      <div className="py-6">{tab === "recipes" ? <RecipeList /> : <PasswordChangeForm />}</div>
    </main>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border-b-2 px-4 py-2 font-body text-sm transition-colors focus-visible:outline-2 focus-visible:outline-turmeric ${
        active ? "border-turmeric text-ink" : "border-transparent text-ink/60 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
