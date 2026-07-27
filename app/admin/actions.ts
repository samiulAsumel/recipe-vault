'use server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { upsertDish } from '@/lib/admin-recipes';
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  getAdminCredentials,
  saveAdminCredentials,
} from '@/lib/auth/admin-credentials';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, verifySessionToken } from '@/lib/auth/session';
import type { Recipe } from '@/types/recipe';

const MIN_PASSWORD_LENGTH = 8;

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

/** Section 11: username/password form, PBKDF2 check. First-ever login (no `admin:credentials`
 * record in KV yet) only accepts the documented default and lazily creates that record,
 * flagged mustChangePassword - no separate seed script needed. */
export async function loginAction(formData: FormData): Promise<void> {
  const username = formString(formData, 'username');
  const password = formString(formData, 'password');

  const { env } = getCloudflareContext();
  const stored = await getAdminCredentials(env);

  let isValid = false;

  if (!stored) {
    if (username === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
      await saveAdminCredentials(env, {
        username: DEFAULT_ADMIN_USERNAME,
        passwordHash: await hashPassword(DEFAULT_ADMIN_PASSWORD),
        mustChangePassword: true,
        updatedAt: new Date().toISOString(),
      });
      isValid = true;
    }
  } else if (username === stored.username) {
    isValid = await verifyPassword(password, stored.passwordHash);
  }

  if (!isValid) {
    redirect('/admin?error=invalid');
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  // Must match the path the cookie was set with (loginAction) - browsers key cookies by
  // (name, path), so deleting with the default path='/' silently no-ops on a cookie set at
  // path='/admin', leaving the session live.
  cookieStore.delete({ name: SESSION_COOKIE_NAME, path: '/admin' });
  redirect('/admin');
}

/** Section 11 point 3: same form for the forced first-login gate and the ongoing Settings
 * tab. Clears mustChangePassword on success - re-read fresh from KV on the next request, not
 * carried in the session token, so the change takes effect immediately. */
export async function changePasswordAction(formData: FormData): Promise<void> {
  const { env } = getCloudflareContext();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const hasValidSession = await verifySessionToken(token, env.SESSION_SECRET);
  if (!hasValidSession) {
    redirect('/admin');
  }

  const currentPassword = formString(formData, 'currentPassword');
  const newPassword = formString(formData, 'newPassword');
  const confirmPassword = formString(formData, 'confirmPassword');

  const stored = await getAdminCredentials(env);
  if (!stored || !(await verifyPassword(currentPassword, stored.passwordHash))) {
    redirect('/admin?passwordError=current');
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    redirect('/admin?passwordError=weak');
  }
  if (newPassword !== confirmPassword) {
    redirect('/admin?passwordError=mismatch');
  }
  if (newPassword === DEFAULT_ADMIN_PASSWORD) {
    redirect('/admin?passwordError=default');
  }

  await saveAdminCredentials(env, {
    username: stored.username,
    passwordHash: await hashPassword(newPassword),
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  });

  redirect('/admin');
}

export interface SaveDishResult {
  success: boolean;
  error?: string;
}

/** Section 12/13: called directly as an RPC from the client DishForm (not bound to a <form
 * action>) since it needs to submit a rich nested object, not FormData. Server Actions are
 * reachable as their own endpoint regardless of how the page renders, so the session is
 * re-verified here too - the page's own gate isn't a substitute. */
export async function saveDishAction(
  recipe: Recipe,
  previousCountrySlug?: string,
): Promise<SaveDishResult> {
  const { env } = getCloudflareContext();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  const hasValidSession = await verifySessionToken(token, env.SESSION_SECRET);
  if (!hasValidSession) {
    return { success: false, error: 'Not authenticated.' };
  }

  try {
    await upsertDish(env, recipe, previousCountrySlug);
    return { success: true };
  } catch (error) {
    console.error('Failed to save dish', error);
    return { success: false, error: 'Could not save this dish. Please try again.' };
  }
}
