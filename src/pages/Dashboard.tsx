import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getDashboardAnalytics, type DashboardData } from '../services/dashboard';

type Range = 'today' | '7' | '30' | 'all';
const rangeLabels: Record<Range, string> = { today: 'Today', '7': '7 Days', '30': '30 Days', all: 'All Time' };

function keyOf(value: unknown) { return String(value || 'UNKNOWN').trim().toUpperCase().replace(/[ -]+/g, '_'); }
function isCompleted(value: unknown) { return ['COMPLETED', 'COMPLETE', 'DONE', 'RESOLVED', 'CLOSED', 'PASSED'].includes(keyOf(value)); }
function isOverdue(item: any) {
  if (!item.due_date || isCompleted(item.status)) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(`${item.due_date}T00:00:00`) < today;
}
function inRange(createdAt: string | undefined, range: Range) {
  if (range === 'all' || !createdAt) return true;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  if (range !== 'today') start.setDate(start.getDate() - Number(range) + 1);
  return new Date(createdAt) >= start;
}
function titleCase(value: unknown) { return String(value || 'Unknown').toLowerCase().replace(/(^|[_ ])\w/g, (letter) => letter.toUpperCase()).replace(/_/g, ' '); }
function formatHours(seconds: number) { return `${(seconds / 3600).toFixed(1)}h`; }
function activityRecordName(item: any, data: DashboardData) {
  const source = String(item.entity_type || '').toLowerCase();
  const records = source.includes('client') ? data.clients : source.includes('project') ? data.projects : source.includes('task') ? data.tasks : source.includes('requirement') ? data.requirements : source.includes('fix') ? data.fixes : [];
  const record = records.find((entry) => entry.id === item.entity_id);
  return record?.name || record?.title || record?.company || item.entity_type || 'Record';
}

function MetricCard({ label, value, detail }: { label: string; value: number | string; detail?: string }) {
  return <div className="rounded-2xl border border-[#242936] bg-linear-to-br from-[#11141b] to-[#0f1118] p-5 shadow-[0_8px_30px_-12px_rgba(139,92,246,0.15)]">
    <div className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">{label}</div>
    <div className="mt-2 text-3xl font-semibold text-[#f8fafc]">{value}</div>
    {detail && <div className="mt-1 text-xs text-[#94a3b8]">{detail}</div>}
  </div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[#242936] bg-[#11141b] p-6"><h2 className="mb-5 text-base font-semibold text-[#f8fafc]">{title}</h2>{children}</section>;
}

const chartColors = ['#8b5cf6', '#c4b5fd', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#94a3b8'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [range, setRange] = useState<Range>('all');
  const [error, setError] = useState('');

  useEffect(() => { getDashboardAnalytics().then(setData).catch((reason) => setError(reason?.message || 'Could not load dashboard data.')); }, []);
  if (error) return <div className="p-8 text-red-300">{error}</div>;
  if (!data) return <div className="p-8 text-[#94a3b8]">Loading analytics...</div>;

  const clients = data.clients.filter((item) => inRange(item.created_at, range));
  const projects = data.projects.filter((item) => inRange(item.created_at, range));
  const tasks = data.tasks.filter((item) => inRange(item.created_at, range));
  const activity = data.activity.filter((item) => inRange(item.created_at, range));
  const timeEntries = data.timeEntries.filter((item) => inRange(item.started_at, range));

  const completedTasks = tasks.filter((item) => isCompleted(item.status)).length;
  const inProgressTasks = tasks.filter((item) => ['IN_PROGRESS', 'INPROGRESS', 'TESTING', 'REVIEW'].includes(keyOf(item.status))).length;
  const pendingTasks = tasks.filter((item) => ['TODO', 'PENDING', 'OPEN', 'NOT_STARTED'].includes(keyOf(item.status))).length;
  const blockedTasks = tasks.filter((item) => keyOf(item.status) === 'BLOCKED').length;
  const overdueTasks = tasks.filter(isOverdue).length;
  const activeProjects = projects.filter((item) => ['IN_PROGRESS', 'ACTIVE', 'OPEN'].includes(keyOf(item.status))).length;
  const statusValues = tasks.reduce<Record<string, number>>((result, item) => { const status = keyOf(item.status); result[status] = (result[status] || 0) + 1; return result; }, {});
  const priorityValues = tasks.reduce<Record<string, number>>((result, item) => { const priority = keyOf(item.priority); result[priority] = (result[priority] || 0) + 1; return result; }, {});
  const statusChartData = Object.entries(statusValues).map(([name, value]) => ({ name: titleCase(name), value }));
  const priorityChartData = Object.entries(priorityValues).map(([name, value]) => ({ name: titleCase(name), value }));
  const trackedSeconds = timeEntries.reduce((total, entry) => total + (entry.ended_at ? entry.duration_seconds : Math.max(0, Math.floor((Date.now() - new Date(entry.started_at).getTime()) / 1000))), 0);
  const timeByTask = timeEntries.reduce<Record<string, number>>((result, entry) => { result[entry.task_id] = (result[entry.task_id] || 0) + (entry.ended_at ? entry.duration_seconds : Math.max(0, Math.floor((Date.now() - new Date(entry.started_at).getTime()) / 1000))); return result; }, {});
  const topTrackedTasks = Object.entries(timeByTask).sort(([, first], [, second]) => second - first).slice(0, 5);

  return <div className="space-y-6 p-6 text-white">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><p className="text-sm text-[#94a3b8]">Live database analytics</p><h1 className="mt-1 text-3xl font-bold text-[#f8fafc]">Command Center</h1></div>
      <div className="flex rounded-lg border border-[#2a3040] bg-[#11141b] p-1">{(Object.keys(rangeLabels) as Range[]).map((option) => <button key={option} onClick={() => setRange(option)} className={`rounded-md px-3 py-2 text-sm ${range === option ? 'bg-[#29213f] text-[#f8fafc]' : 'text-[#94a3b8] hover:text-white'}`}>{rangeLabels[option]}</button>)}</div>
    </header>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total Clients" value={clients.length} /><MetricCard label="Active Projects" value={activeProjects} /><MetricCard label="Total Tasks" value={tasks.length} /><MetricCard label="Completed Tasks" value={completedTasks} />
      <MetricCard label="In Progress" value={inProgressTasks} /><MetricCard label="Pending" value={pendingTasks} /><MetricCard label="Blocked" value={blockedTasks} /><MetricCard label="Overdue" value={overdueTasks} />
    </div>

    <Panel title="Time Tracking"><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><MiniStat label="Tracked Time" value={data.timeTrackingAvailable ? formatHours(trackedSeconds) : 'N/A'} /><MiniStat label="Sessions" value={data.timeTrackingAvailable ? timeEntries.length : 'N/A'} /><MiniStat label="Active Timers" value={data.timeTrackingAvailable ? timeEntries.filter((entry) => !entry.ended_at).length : 'N/A'} /></div>{data.timeTrackingAvailable && topTrackedTasks.length > 0 && <div className="mt-4 space-y-2">{topTrackedTasks.map(([taskId, seconds]) => <div key={taskId} className="flex justify-between border-b border-[#242936] pb-2 text-sm"><span className="text-[#cbd5e1]">{tasks.find((task) => task.id === taskId)?.title || 'Task'}</span><span className="text-[#c4b5fd]">{formatHours(seconds)}</span></div>)}</div>}{!data.timeTrackingAvailable && <p className="mt-3 text-xs text-[#64748b]">Run <span className="text-[#c4b5fd]">supabase/task_time_entries.sql</span> to enable persistent tracking.</p>}</Panel>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Panel title="Task Status Distribution"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>{statusChartData.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip contentStyle={{ background: '#11141b', border: '1px solid #2a3040', borderRadius: 8, color: '#f8fafc' }} /></PieChart></ResponsiveContainer></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#94a3b8]">{statusChartData.map((item) => <span key={item.name}>{item.name}: {item.value}</span>)}</div></Panel>
      <Panel title="Priority Analytics"><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="#242936" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#11141b', border: '1px solid #2a3040', borderRadius: 8, color: '#f8fafc' }} /><Bar dataKey="value" name="Tasks" fill="#8b5cf6" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#94a3b8]">{priorityChartData.map((item) => <span key={item.name}>{item.name}: {item.value}</span>)}</div></Panel>
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><Panel title="Recent Activity"><div className="divide-y divide-[#242936]">{activity.slice(0, 10).map((item, index) => <div key={`${item.created_at}-${index}`} className="flex justify-between gap-4 py-3 text-sm"><div><span className="font-medium text-[#c4b5fd]">{item.action || 'Activity'}</span><p className="mt-1 text-[#94a3b8]">{item.entity_type || 'Record'} · {activityRecordName(item, data)}</p></div><time className="shrink-0 text-xs text-[#64748b]">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</time></div>)}{activity.length === 0 && <p className="text-sm text-[#64748b]">No activity in this period.</p>}</div></Panel>
      <Panel title="Data Availability"><div className="space-y-3 text-sm"><div className="flex justify-between border-b border-[#242936] pb-3"><span className="text-[#cbd5e1]">Assigned user analytics</span><span className="text-[#94a3b8]">N/A</span></div><div className="flex justify-between border-b border-[#242936] pb-3"><span className="text-[#cbd5e1]">Dependencies and blocked-by links</span><span className="text-[#94a3b8]">N/A</span></div><div className="flex justify-between border-b border-[#242936] pb-3"><span className="text-[#cbd5e1]">Task time tracking</span><span className={data.timeTrackingAvailable ? 'text-emerald-300' : 'text-[#94a3b8]'}>{data.timeTrackingAvailable ? 'Available' : 'N/A'}</span></div><div className="flex justify-between"><span className="text-[#cbd5e1]">Task completion duration</span><span className="text-[#94a3b8]">N/A</span></div></div><p className="mt-5 text-xs text-[#64748b]">Time tracking is calculated from saved task sessions; unavailable schema fields remain N/A.</p></Panel>
    </div>
  </div>;
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-lg border border-[#242936] bg-[#0d1016] px-3 py-2"><div className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">{label}</div><div className="mt-1 text-lg font-semibold text-[#f8fafc]">{value}</div></div>;
}