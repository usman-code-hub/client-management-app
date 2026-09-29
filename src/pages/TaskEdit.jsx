import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProjects } from '../services/projects';
import { supabase } from '../lib/supabase';

const inputClass = 'w-full rounded-xl border border-[#292e39] bg-[#0b0e14] px-3.5 py-3 text-sm text-[#F5F7FB] outline-none transition focus:border-[#7957ff] focus:ring-4 focus:ring-[#7957ff]/10';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-[#C8D0DC]';

export default function TaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: '', project_id: '', status: 'TODO', priority: 'MEDIUM', due_date: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadTask() {
      const [{ data, error }, projectRows] = await Promise.all([
        supabase.from('tasks').select('*').eq('id', id).single(),
        getProjects().catch(() => [])
      ]);
      setProjects(projectRows);
      if (error) setMessage(error.message);
      else if (data) setForm({ title: data.title || '', project_id: data.project_id || '', status: data.status || 'TODO', priority: data.priority || 'MEDIUM', due_date: data.due_date || '', description: data.description || '' });
      setLoading(false);
    }
    void loadTask();
  }, [id]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('tasks').update({ ...form, project_id: form.project_id || null, due_date: form.due_date || null }).eq('id', id);
    if (error) {
      setMessage(`Could not update task: ${error.message}`);
      setSaving(false);
      return;
    }
    navigate('/tasks');
  }

  if (loading) return <div className="p-8 text-gray-400">Loading task...</div>;

  return <div className="max-w-4xl p-8 text-white"><Link to="/tasks" className="text-sm text-[#A78BFA] hover:text-white">Back to Tasks</Link><h1 className="mt-4 text-3xl font-bold">Edit Task</h1><p className="mt-2 text-sm text-gray-400">Update the task stored in Supabase.</p><form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-5 rounded-2xl border border-[#242936]/70 bg-linear-to-br from-[#11141B] to-[#0f1118] p-6 md:grid-cols-2"><label className="md:col-span-2"><span className={labelClass}>Task Title</span><input className={inputClass} name="title" value={form.title} onChange={handleChange} required /></label><label><span className={labelClass}>Project</span><select className={inputClass} name="project_id" value={form.project_id} onChange={handleChange}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name || project.id}</option>)}</select></label><label><span className={labelClass}>Status</span><select className={inputClass} name="status" value={form.status} onChange={handleChange}>{['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'Backlog', 'Todo', 'In Progress', 'Completed'].map((value) => <option key={value}>{value}</option>)}</select></label><label><span className={labelClass}>Priority</span><select className={inputClass} name="priority" value={form.priority} onChange={handleChange}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'Low', 'Medium', 'High', 'Critical'].map((value) => <option key={value}>{value}</option>)}</select></label><label><span className={labelClass}>Due Date</span><input className={inputClass} name="due_date" type="date" value={form.due_date} onChange={handleChange} /></label><label className="md:col-span-2"><span className={labelClass}>Description</span><textarea className={`${inputClass} min-h-32 resize-y`} name="description" value={form.description} onChange={handleChange} /></label><div className="flex justify-end gap-3 md:col-span-2"><Link to="/tasks" className="rounded-xl border border-[#2b303b] bg-[#191d25] px-5 py-3 text-sm font-semibold text-[#C4C9D3]">Cancel</Link><button disabled={saving} className="rounded-xl bg-linear-to-br from-[#6d4aff] to-[#925cff] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button></div>{message && <p className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{message}</p>}</form></div>;
}
