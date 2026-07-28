import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-static";

// Section 14: "if desired" — a curated, adjustable list of known AI-training
// crawlers. Doesn't stop everything, but signals intent and legitimate bots
// respect it. Real protection is Cloudflare-side (Bot Fight Mode, rate
// limiting — see README), not this file.
const AI_TRAINING_CRAWLERS = [
  "GPTBot",
  "CCBot",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "Bytespider",
  "Diffbot",
  "PerplexityBot",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
      ...AI_TRAINING_CRAWLERS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    ...(siteUrl ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}
