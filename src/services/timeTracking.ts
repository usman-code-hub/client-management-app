import { supabase } from '../lib/supabase';

export async function getTaskTimeEntries(taskId: string) {
  const result = await supabase
    .from('task_time_entries')
    .select('id, task_id, started_at, ended_at, duration_seconds')
    .eq('task_id', taskId)
    .order('started_at', { ascending: true });
  if (result.error) throw result.error;
  return result.data || [];
}

export async function getAllTimeEntries() {
  const result = await supabase
    .from('task_time_entries')
    .select('id, task_id, started_at, ended_at, duration_seconds')
    .order('started_at', { ascending: true });
  if (result.error) throw result.error;
  return result.data || [];
}

export async function startTimeEntry(taskId: string) {
  return supabase.from('task_time_entries').insert({
    task_id: taskId,
    started_at: new Date().toISOString(),
    duration_seconds: 0,
  }).select().single();
}

export async function stopTimeEntry(entryId: string, startedAt: string) {
  const endedAt = new Date();
  const started = new Date(startedAt);
  const durationSeconds = Math.max(0, Math.floor((endedAt.getTime() - started.getTime()) / 1000));
  return supabase.from('task_time_entries').update({
    ended_at: endedAt.toISOString(),
    duration_seconds: durationSeconds,
  }).eq('id', entryId).is('ended_at', null).select().single();
}

export async function addManualTimeEntry(taskId: string, minutes: number) {
  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - minutes * 60 * 1000);
  return supabase.from('task_time_entries').insert({
    task_id: taskId,
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
    duration_seconds: Math.floor(minutes * 60),
  }).select().single();
}

export async function deleteTaskTimeEntries(taskId: string) {
  return supabase.from('task_time_entries').delete().eq('task_id', taskId);
}
