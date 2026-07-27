interface ChangePasswordFormProps {
  action: (formData: FormData) => Promise<void>;
  error?: string;
  forced?: boolean;
}

const ERROR_MESSAGES: Record<string, string> = {
  current: 'Current password is incorrect.',
  weak: 'New password must be at least 8 characters.',
  mismatch: 'New password and confirmation do not match.',
  default: 'New password cannot be the default password.',
};

/** Section 11 point 3: "password change form (a settings tab, permanently available, even
 * after first login)" - the same form serves two contexts: the forced first-login gate
 * (`forced`) and the ongoing Settings tab. */
export function ChangePasswordForm({
  action,
  error,
  forced = false,
}: ChangePasswordFormProps): React.ReactElement {
  return (
    <form action={action} className="w-full max-w-sm border border-clay-line bg-parchment p-6">
      <h1 className="font-display text-2xl text-ink">
        {forced ? 'Change your password before continuing' : 'Change password'}
      </h1>
      {forced ? (
        <p className="mt-2 text-sm text-ink/60">
          You are signed in with the default password. Set a new one to continue.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 border border-paprika px-3 py-2 text-sm text-paprika">
          {ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.'}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Current password
          <input
            type="password"
            name="currentPassword"
            required
            autoComplete="current-password"
            className="border border-clay-line bg-parchment px-3 py-2 text-ink focus-visible:border-turmeric"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          New password
          <input
            type="password"
            name="newPassword"
            required
            minLength={8}
            autoComplete="new-password"
            className="border border-clay-line bg-parchment px-3 py-2 text-ink focus-visible:border-turmeric"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Confirm new password
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
            className="border border-clay-line bg-parchment px-3 py-2 text-ink focus-visible:border-turmeric"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 w-full border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-widest text-parchment transition-colors hover:border-turmeric hover:bg-turmeric"
      >
        Update password
      </button>
    </form>
  );
}
