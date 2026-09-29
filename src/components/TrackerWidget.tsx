import { useEffect, useMemo, useState } from 'react';
import { addManualTimeEntry, deleteTaskTimeEntries, getTaskTimeEntries, startTimeEntry, stopTimeEntry } from '../services/timeTracking';

type TimeEntry = { id: string; started_at: string; ended_at: string | null; duration_seconds: number };

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(remainingSeconds).padStart(2, '0')}s`;
}

export default function TrackerWidget({ taskId, label }: { taskId: string; label?: string }) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [now, setNow] = useState(Date.now());
  const [manualMinutes, setManualMinutes] = useState(['15', '30', '60']);
  const [message, setMessage] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinAction, setPinAction] = useState<{ type: 'add' | 'reset'; index?: number } | null>(null);

  const activeEntry = entries.find((entry) => !entry.ended_at);
  const totalSeconds = useMemo(() => entries.reduce((total, entry) => total + (entry.ended_at ? entry.duration_seconds : Math.max(0, Math.floor((now - new Date(entry.started_at).getTime()) / 1000))), 0), [entries, now]);

  async function refresh() {
    try {
      setEntries(await getTaskTimeEntries(taskId));
      setMessage('');
    } catch (error: any) {
      setMessage(error?.message || 'Run the task_time_entries SQL first.');
    }
  }

  useEffect(() => { void refresh(); }, [taskId]);
  useEffect(() => {
    if (!activeEntry) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeEntry]);

  async function handleStart() {
    const result = await startTimeEntry(taskId);
    if (result.error) setMessage(result.error.message);
    else await refresh();
  }

  async function handleStop() {
    if (!activeEntry) return;
    const result = await stopTimeEntry(activeEntry.id, activeEntry.started_at);
    if (result.error) setMessage(result.error.message);
    else await refresh();
  }

  async function handleCustomTime(index: number) {
    if (Number(manualMinutes[index]) > 0) {
      setPin('');
      setPinError('');
      setPinAction({ type: 'add', index });
    }
  }

  function handleReset() {
    setPin('');
    setPinError('');
    setPinAction({ type: 'reset' });
  }

  async function confirmPin() {
    const configuredPin = import.meta.env.VITE_TIME_TRACKER_PIN || '';
    if (!configuredPin) {
      setPinError('Add VITE_TIME_TRACKER_PIN to .env.local, then restart the app.');
      return;
    }
    if (pin !== configuredPin) {
      setPinError('Incorrect PIN.');
      return;
    }
    if (pinAction?.type === 'reset') {
      const result = await deleteTaskTimeEntries(taskId);
      if (result.error) setPinError(result.error.message);
      else { setPinAction(null); await refresh(); }
      return;
    }
    const minutes = Number(manualMinutes[pinAction?.index || 0]);
    const result = await addManualTimeEntry(taskId, minutes);
    if (result.error) setPinError(result.error.message);
    else { setPinAction(null); await refresh(); }
  }

  return <div className="mt-3 rounded-xl border border-[#242936] bg-[#0d1016] p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><span className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">Time {label ? `· ${label}` : ''}</span><div className="mt-1 text-lg font-semibold text-[#c4b5fd]">{formatDuration(totalSeconds)}</div></div>
      <span className="text-xs text-[#94a3b8]">{activeEntry ? 'Running' : entries.length ? 'Paused' : 'Not started'}</span>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {!activeEntry && <button type="button" onClick={() => void handleStart()} className="rounded-lg bg-[#8b5cf6] px-3 py-1.5 text-xs font-semibold text-white">{entries.length ? 'Resume' : 'Start'}</button>}
      {activeEntry && <><button type="button" onClick={() => void handleStop()} className="rounded-lg bg-[#f59e0b] px-3 py-1.5 text-xs font-semibold text-white">Pause</button><button type="button" onClick={() => void handleStop()} className="rounded-lg bg-[#ef4444] px-3 py-1.5 text-xs font-semibold text-white">Stop</button></>}
      {manualMinutes.map((minutes, index) => <span key={index} className="flex items-center gap-1"><input type="number" min="1" value={minutes} onChange={(event) => setManualMinutes((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className="w-16 rounded-lg border border-[#242936] bg-[#11141b] px-2 py-1.5 text-xs text-white" aria-label={`Custom time option ${index + 1}`} /><button type="button" onClick={() => void handleCustomTime(index)} className="rounded-lg border border-[#242936] px-2 py-1.5 text-xs text-[#c8d0dc]">Add</button></span>)}
      <button type="button" onClick={() => void handleReset()} className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-300">Reset 0</button>
    </div>
    {message && <p className="mt-2 text-xs text-red-300">{message}</p>}
    {pinAction && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Tracker PIN">
      <div className="w-full max-w-xs rounded-xl border border-[#343b4d] bg-[#11141b] p-5 shadow-2xl">
        <h3 className="text-sm font-semibold text-white">Enter tracker PIN</h3>
        <p className="mt-1 text-xs text-[#94a3b8]">{pinAction.type === 'reset' ? 'Confirm reset tracked time to zero.' : 'Confirm custom time entry.'}</p>
        <input autoFocus type="password" value={pin} onChange={(event) => setPin(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void confirmPin(); }} className="mt-4 w-full rounded-lg border border-[#2a3040] bg-[#0d1016] px-3 py-2 text-sm text-white outline-none focus:border-[#8b5cf6]" placeholder="PIN" />
        {pinError && <p className="mt-2 text-xs text-red-300">{pinError}</p>}
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setPinAction(null)} className="rounded-lg border border-[#2a3040] px-3 py-2 text-xs text-[#c8d0dc]">Cancel</button><button type="button" onClick={() => void confirmPin()} className="rounded-lg bg-[#8b5cf6] px-3 py-2 text-xs font-semibold text-white">Confirm</button></div>
      </div>
    </div>}
  </div>;
}