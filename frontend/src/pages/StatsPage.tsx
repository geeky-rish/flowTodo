import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Zap, CheckCircle2, Target, Flame } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { statsApi } from '@/services/api';
import { format, parseISO } from 'date-fns';
import type { Stats } from '@/types';

function StatBlock({ icon: Icon, label, value, sublabel, color }: {
  icon: typeof CheckCircle2;
  label: string;
  value: string | number;
  sublabel?: string;
  color: string;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{value}</p>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        {sublabel && <p className="text-xs text-zinc-400 dark:text-zinc-500">{sublabel}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-surface-850 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg text-xs">
        <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    statsApi.get()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center border-red-200 dark:border-red-900">
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load statistics: {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const chartData = stats.daily_stats.map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    Completed: d.completed,
    Created: d.created,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary-600" />
          Statistics
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your productivity insights</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatBlock icon={CheckCircle2} label="Completed this week" value={stats.completed_this_week} color="bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400" />
        <StatBlock icon={TrendingUp} label="Completed this month" value={stats.completed_this_month} color="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" />
        <StatBlock icon={Target} label="Completion rate" value={`${stats.completion_rate}%`} sublabel={`${stats.total_tasks} total tasks`} color="bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400" />
        <StatBlock icon={Zap} label="High priority rate" value={`${stats.high_priority_completion_rate}%`} color="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400" />
        <StatBlock icon={Flame} label="Current streak" value={`${stats.streak}d`} sublabel="consecutive days" color="bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400" />
        <StatBlock icon={CheckCircle2} label="Completed today" value={stats.completed_today} color="bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400" />
      </div>

      {/* Chart: Daily activity */}
      <div className="card p-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          14-day Activity
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-zinc-400" />
            <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-zinc-400" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Created" fill="#a5b4fc" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Completed" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart: Trend line */}
      <div className="card p-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Completion Trend
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-zinc-400" />
            <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-zinc-400" allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Completed" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="Created" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
