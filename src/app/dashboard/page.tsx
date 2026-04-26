'use client';
import { useEffect, useState } from 'react';

type Summary = {
  totals: { visitors: number; days: number; perDay: Record<string, number> };
  topPages: { key: string; count: number }[];
  sources: { key: string; count: number }[];
  devices: { key: string; count: number }[];
  languages: { key: string; count: number }[];
  countries: { key: string; count: number }[];
};

export default function Dashboard() {
  const [token, setToken] = useState('');
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?days=${days}`, {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = (await res.json()) as Summary;
      setData(j);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('an_tok') : null;
    if (stored) setToken(stored);
  }, []);

  function onAuth() {
    if (typeof window !== 'undefined') sessionStorage.setItem('an_tok', token);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <p className="text-gray-600 mt-1 text-sm">First-party, cookieless. Set <code>ANALYTICS_TOKEN</code> in env to require auth.</p>

      <div className="flex flex-wrap gap-2 items-end mt-5">
        <div>
          <label className="text-xs text-gray-600 block">Token (if set)</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            placeholder="optional"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 block">Days</label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="border border-gray-300 rounded px-3 py-1.5 text-sm">
            <option value={7}>Last 7</option>
            <option value={30}>Last 30</option>
            <option value={90}>Last 90</option>
          </select>
        </div>
        <button onClick={onAuth} className="px-4 py-1.5 rounded bg-brand-600 text-white text-sm hover:bg-brand-700">
          Load
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-600">Loading…</p>}
      {error && <p className="mt-6 text-sm text-red-700">{error}</p>}

      {data && (
        <div className="mt-8 space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Pageviews" value={data.totals.visitors.toLocaleString()} />
            <Stat label="Window" value={`${data.totals.days} days`} />
            <Stat label="Active days" value={Object.keys(data.totals.perDay).length} />
          </div>

          <Spark perDay={data.totals.perDay} />

          <div className="grid gap-6 md:grid-cols-2">
            <Table title="Top pages" rows={data.topPages} max={20} link />
            <Table title="Sources" rows={data.sources} max={15} />
            <Table title="Devices" rows={data.devices} max={5} />
            <Table title="Countries" rows={data.countries} max={15} />
            <Table title="Languages" rows={data.languages} max={10} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Spark({ perDay }: { perDay: Record<string, number> }) {
  const days = Object.keys(perDay).sort();
  if (!days.length) return null;
  const counts = days.map((d) => perDay[d]);
  const max = Math.max(1, ...counts);
  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Daily pageviews</div>
      <div className="flex items-end gap-1 h-24">
        {days.map((d, i) => (
          <div
            key={d}
            title={`${d}: ${counts[i]}`}
            className="flex-1 bg-brand-500/90 hover:bg-brand-700 rounded-t"
            style={{ height: `${Math.max(2, (counts[i] / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-1">
        <span>{days[0]}</span>
        <span>{days[days.length - 1]}</span>
      </div>
    </div>
  );
}

function Table({
  title,
  rows,
  max,
  link,
}: {
  title: string;
  rows: { key: string; count: number }[];
  max: number;
  link?: boolean;
}) {
  const top = rows.slice(0, max);
  const maxCount = Math.max(1, ...top.map((r) => r.count));
  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">{title}</div>
      {top.length === 0 && <div className="text-sm text-gray-500">No data.</div>}
      <ul className="space-y-1.5">
        {top.map((r) => (
          <li key={r.key} className="text-sm">
            <div className="flex justify-between gap-3">
              <span className="truncate">
                {link ? (
                  <a href={r.key} className="text-brand-700 hover:underline" target="_blank" rel="noopener">
                    {r.key}
                  </a>
                ) : (
                  r.key
                )}
              </span>
              <span className="text-gray-600 tabular-nums">{r.count}</span>
            </div>
            <div className="h-1 mt-1 bg-gray-100 rounded">
              <div className="h-1 bg-brand-500 rounded" style={{ width: `${(r.count / maxCount) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
