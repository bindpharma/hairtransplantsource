import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

// Simple, file-based analytics. JSONL append per day. No cookies, no IPs stored.
// In production behind Vercel/CDN you can swap this for an edge-config or KV write.

const LOG_DIR = path.join(process.cwd(), '.analytics');

function todayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function ensureDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function deriveDevice(screen: string): 'mobile' | 'tablet' | 'desktop' {
  const w = parseInt((screen ?? '').split('x')[0] ?? '0', 10);
  if (!w) return 'desktop';
  if (w < 600) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function parseSource(referrer: string): string {
  if (!referrer) return 'direct';
  try {
    const u = new URL(referrer);
    const host = u.hostname.replace(/^www\./, '');
    if (/google\./.test(host)) return 'google';
    if (/bing\./.test(host)) return 'bing';
    if (/duckduckgo\./.test(host)) return 'duckduckgo';
    if (/yandex\./.test(host)) return 'yandex';
    if (/baidu\./.test(host)) return 'baidu';
    if (/twitter\.com|t\.co|x\.com/.test(host)) return 'twitter';
    if (/facebook\.com|fb\.com/.test(host)) return 'facebook';
    if (/linkedin\.com/.test(host)) return 'linkedin';
    if (/reddit\.com/.test(host)) return 'reddit';
    if (/youtube\.com|youtu\.be/.test(host)) return 'youtube';
    return host;
  } catch {
    return 'direct';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const country = req.headers.get('x-vercel-ip-country') ?? req.geo?.country ?? 'XX';
    const event = {
      ts: Date.now(),
      p: typeof body.p === 'string' ? body.p.slice(0, 200) : '',
      src: parseSource(typeof body.r === 'string' ? body.r : ''),
      dev: deriveDevice(typeof body.s === 'string' ? body.s : ''),
      lang: typeof body.l === 'string' ? body.l.slice(0, 8) : '',
      country,
    };
    ensureDir();
    fs.appendFileSync(path.join(LOG_DIR, `${todayKey()}.jsonl`), JSON.stringify(event) + '\n');
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'POST events here' });
}

export const runtime = 'nodejs';
