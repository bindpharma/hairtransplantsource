import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.join(process.cwd(), '.analytics');

type Event = { ts: number; p: string; src: string; dev: string; lang: string; country: string };

function loadEvents(days: number): Event[] {
  if (!fs.existsSync(LOG_DIR)) return [];
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(LOG_DIR).filter((f) => f.endsWith('.jsonl')).sort();
  const events: Event[] = [];
  for (const f of files) {
    const lines = fs.readFileSync(path.join(LOG_DIR, f), 'utf8').split('\n');
    for (const ln of lines) {
      if (!ln) continue;
      try {
        const e = JSON.parse(ln) as Event;
        if (e.ts >= cutoff) events.push(e);
      } catch {}
    }
  }
  return events;
}

function topN<K extends string>(items: K[], n: number): { key: K; count: number }[] {
  const map = new Map<K, number>();
  for (const k of items) map.set(k, (map.get(k) ?? 0) + 1);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  const expected = process.env.ANALYTICS_TOKEN;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const days = Number(req.nextUrl.searchParams.get('days') ?? '30');
  const events = loadEvents(days);

  const totals = {
    visitors: events.length, // pageviews proxy
    days,
    perDay: {} as Record<string, number>,
  };
  for (const e of events) {
    const day = new Date(e.ts).toISOString().slice(0, 10);
    totals.perDay[day] = (totals.perDay[day] ?? 0) + 1;
  }

  const summary = {
    totals,
    topPages: topN(events.map((e) => e.p), 20),
    sources:  topN(events.map((e) => e.src), 15),
    devices:  topN(events.map((e) => e.dev), 5),
    languages:topN(events.map((e) => e.lang).filter(Boolean), 10),
    countries:topN(events.map((e) => e.country), 15),
  };

  return NextResponse.json(summary);
}

export const runtime = 'nodejs';
