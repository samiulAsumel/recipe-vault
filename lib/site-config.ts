/** Same Cloudflare Pages project/domain as the old site (Section 0) - override via
 * NEXT_PUBLIC_SITE_URL once a custom domain is attached. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://recipevault91.pages.dev').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'World Kitchen Atlas';
