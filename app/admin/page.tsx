import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { changePasswordAction, loginAction, logoutAction } from '@/app/admin/actions';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { ChangePasswordForm } from '@/components/admin/ChangePasswordForm';
import { LoginForm } from '@/components/admin/LoginForm';
import { ManageRecipesTab } from '@/components/admin/ManageRecipesTab';
import { getAnalyticsSummary } from '@/lib/analytics';
import { getAdminCredentials } from '@/lib/auth/admin-credentials';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/** Forces per-request generation - both the session cookie and the KV-backed analytics/
 * credentials state must never be cached or prerendered. */
export const dynamic = 'force-dynamic';

interface AdminPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function CenteredScreen({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-parchment px-6 text-ink">
      {children}
    </main>
  );
}

/** Section 11's "Joruri security note": the hidden Ctrl+Shift+Click entry (SiteFooter) is
 * discovery-only obscurity, not security - this route must enforce a real login check no
 * matter how it's reached, including a direct URL visit. Everything below this line is that
 * check; nothing renders before it passes. */
export default async function AdminPage({ searchParams }: AdminPageProps): Promise<React.ReactElement> {
  const rawSearchParams = await searchParams;
  const { env } = getCloudflareContext();

  if (!env.SESSION_SECRET) {
    return (
      <CenteredScreen>
        <p className="max-w-md text-center text-ink/60">
          Admin login is not configured yet (missing SESSION_SECRET).
        </p>
      </CenteredScreen>
    );
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const hasValidSession = await verifySessionToken(sessionToken, env.SESSION_SECRET);

  if (!hasValidSession) {
    return (
      <CenteredScreen>
        <LoginForm action={loginAction} error={firstValue(rawSearchParams.error)} />
      </CenteredScreen>
    );
  }

  const credentials = await getAdminCredentials(env);

  if (credentials?.mustChangePassword) {
    return (
      <CenteredScreen>
        <ChangePasswordForm
          action={changePasswordAction}
          error={firstValue(rawSearchParams.passwordError)}
          forced
        />
      </CenteredScreen>
    );
  }

  const requestedTab = firstValue(rawSearchParams.tab);
  const activeTab = requestedTab === 'settings' || requestedTab === 'recipes' ? requestedTab : 'dashboard';
  const summary = activeTab === 'dashboard' ? await getAnalyticsSummary(env) : null;

  return (
    <main className="min-h-screen bg-parchment px-6 py-16 text-ink">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl">Admin</h1>
          <form action={logoutAction}>
            <button
              type="submit"
              className="border border-clay-line px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:border-paprika"
            >
              Log out
            </button>
          </form>
        </div>

        <nav className="mt-6 flex gap-6 border-b border-clay-line">
          <Link
            href="/admin"
            className={`pb-2 font-mono text-xs uppercase tracking-widest ${
              activeTab === 'dashboard' ? 'border-b-2 border-turmeric text-ink' : 'text-ink/50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin?tab=recipes"
            className={`pb-2 font-mono text-xs uppercase tracking-widest ${
              activeTab === 'recipes' ? 'border-b-2 border-turmeric text-ink' : 'text-ink/50'
            }`}
          >
            Manage Recipes
          </Link>
          <Link
            href="/admin?tab=settings"
            className={`pb-2 font-mono text-xs uppercase tracking-widest ${
              activeTab === 'settings' ? 'border-b-2 border-turmeric text-ink' : 'text-ink/50'
            }`}
          >
            Settings
          </Link>
        </nav>

        <div className="mt-8">
          {activeTab === 'dashboard' && summary ? <AnalyticsDashboard summary={summary} /> : null}
          {activeTab === 'recipes' ? (
            <ManageRecipesTab
              country={firstValue(rawSearchParams.country)}
              dish={firstValue(rawSearchParams.dish)}
            />
          ) : null}
          {activeTab === 'settings' ? (
            <ChangePasswordForm action={changePasswordAction} error={firstValue(rawSearchParams.passwordError)} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
