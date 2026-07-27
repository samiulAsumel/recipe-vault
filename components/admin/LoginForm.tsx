interface LoginFormProps {
  action: (formData: FormData) => Promise<void>;
  error?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'Incorrect username or password.',
};

/** Section 11: username/password form, PBKDF2-checked server-side by loginAction. Plain
 * server-rendered form, no client JS - same "no JS required" pattern as FilterBar. */
export function LoginForm({ action, error }: LoginFormProps): React.ReactElement {
  return (
    <form action={action} className="w-full max-w-sm border border-clay-line bg-parchment p-6">
      <h1 className="font-display text-2xl text-ink">Admin login</h1>

      {error ? (
        <p className="mt-3 border border-paprika px-3 py-2 text-sm text-paprika">
          {ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.'}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Username
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            className="border border-clay-line bg-parchment px-3 py-2 text-ink focus-visible:border-turmeric"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="border border-clay-line bg-parchment px-3 py-2 text-ink focus-visible:border-turmeric"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 w-full border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-widest text-parchment transition-colors hover:border-turmeric hover:bg-turmeric"
      >
        Log in
      </button>
    </form>
  );
}
