import { promises as fs } from "fs";
import { createHash } from "crypto";

const FAVICON_URL = "https://prdHugo.fr/favicon.svg";
const AVATARS_DIR = "public/avatars";

export type AvatarInput = {
  location: string;
  flag: string;
};

function slug(location: string): string {
  return createHash("sha256").update(location.toLowerCase().trim()).digest("hex").slice(0, 12);
}

/**
 * Generates an avatar SVG: favicon base with circular clip (shoulder-to-head style)
 * and a location badge (flag) overlay.
 */
async function generateAvatarSvg(faviconDataUrl: string, flag: string): Promise<string> {
  // Bust/portrait frame: circular clip, focus on upper portion (head to shoulder)
  // preserveAspectRatio="xMidYMin slice" shows top of image for "head" focus
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <clipPath id="circle">
      <circle cx="40" cy="40" r="38"/>
    </clipPath>
  </defs>
  <g clip-path="url(#circle)">
    <image href="${faviconDataUrl}" width="80" height="80" x="0" y="0" preserveAspectRatio="xMidYMin slice"/>
  </g>
  <!-- Location badge: flag in bottom-right corner -->
  <g transform="translate(52, 52)">
    <circle cx="14" cy="14" r="16" fill="rgba(0,0,0,0.5)"/>
    <text x="14" y="18" text-anchor="middle" font-size="18" dominant-baseline="middle">${escapeXml(flag)}</text>
  </g>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchFaviconAsDataUrl(): Promise<string> {
  const res = await fetch(FAVICON_URL);
  if (!res.ok) throw new Error(`Failed to fetch favicon: ${res.status}`);
  const blob = await res.blob();
  const buf = Buffer.from(await blob.arrayBuffer());
  const base64 = buf.toString("base64");
  const mime = blob.type || "image/svg+xml";
  return `data:${mime};base64,${base64}`;
}

export async function ensureAvatarsDir(): Promise<void> {
  await fs.mkdir(AVATARS_DIR, { recursive: true });
}

export async function generateLocationAvatar(input: AvatarInput): Promise<string> {
  await ensureAvatarsDir();
  const id = slug(input.location);
  const path = `${AVATARS_DIR}/${id}.svg`;

  let faviconDataUrl: string;
  try {
    faviconDataUrl = await fetchFaviconAsDataUrl();
  } catch {
    // Fallback: use URL directly (may fail in some browsers due to CORS)
    faviconDataUrl = FAVICON_URL;
  }

  const svg = await generateAvatarSvg(faviconDataUrl, input.flag);
  await fs.writeFile(path, svg, "utf8");
  return `/avatars/${id}.svg`;
}

/** Get stored avatar path for a location, or null if not generated */
export function getAvatarPath(location: string): string {
  const id = slug(location);
  return `/avatars/${id}.svg`;
}

