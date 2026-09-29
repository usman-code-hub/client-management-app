import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getClients } from '../services/clients';
import { supabase } from '../lib/supabase';

const inputClass = 'w-full rounded-xl border border-[#292e39] bg-[#0b0e14] px-3.5 py-3 text-sm text-[#F5F7FB] outline-none transition focus:border-[#7957ff] focus:ring-4 focus:ring-[#7957ff]/10';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-[#C8D0DC]';

export default function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', client_id: '', platform: '', status: 'NEW', priority: 'MEDIUM', due_date: '', description: '', start_date: '', estimated_hours: '', version: '', goals: '', internal_notes: '', project_manager: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProject() {
      if (!id) return;
      const [{ data, error }, clientRows] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        getClients().catch(() => [])
      ]);
      setClients(clientRows);
      if (error) setMessage(error.message);
      else if (data) setForm((current) => ({ ...current, ...data, estimated_hours: data.estimated_hours || '' }));
      setLoading(false);
    }
    void loadProject();
  }, [id]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const payload = { ...form, estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null, client_id: form.client_id || null, due_date: form.due_date || null, start_date: form.start_date || null };
    delete payload.id;
    delete payload.created_at;
    const { error } = await supabase.from('projects').update(payload).eq('id', id);
    if (error) {
      setMessage(`Could not update project: ${error.message}`);
      setSaving(false);
      return;
    }
    navigate('/projects');
  }

  if (loading) return <div className="p-8 text-gray-400">Loading project...</div>;

  return (
    <div className="max-w-5xl p-8 text-white">
      <Link to="/projects" className="text-sm text-[#A78BFA] hover:text-white">Back to Projects</Link>
      <h1 className="mt-4 text-3xl font-bold">Edit Project</h1>
      <p className="mt-2 text-sm text-gray-400">Update the project information stored in Supabase.</p>
      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-5 rounded-2xl border border-[#242936]/70 bg-linear-to-br from-[#11141B] to-[#0f1118] p-6 md:grid-cols-2">
        <label><span className={labelClass}>Project Name</span><input className={inputClass} name="name" value={form.name} onChange={handleChange} required /></label>
        <label><span className={labelClass}>Client</span><select className={inputClass} name="client_id" value={form.client_id || ''} onChange={handleChange}><option value="">No client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name || client.company || client.id}</option>)}</select></label>
        <label><span className={labelClass}>Project Type / Platform</span><input className={inputClass} name="platform" value={form.platform || ''} onChange={handleChange} /></label>
        <label><span className={labelClass}>Status</span><select className={inputClass} name="status" value={form.status || 'NEW'} onChange={handleChange}>{['NEW', 'Planning', 'Active', 'On Hold', 'Testing', 'Completed', 'Cancelled'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span className={labelClass}>Priority</span><select className={inputClass} name="priority" value={form.priority || 'MEDIUM'} onChange={handleChange}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'Low', 'Medium', 'High', 'Critical'].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span className={labelClass}>Target Deadline</span><input className={inputClass} name="due_date" type="date" value={form.due_date || ''} onChange={handleChange} /></label>
        <label className="md:col-span-2"><span className={labelClass}>Description</span><textarea className={`${inputClass} min-h-28 resize-y`} name="description" value={form.description || ''} onChange={handleChange} /></label>
        <label><span className={labelClass}>Start Date</span><input className={inputClass} name="start_date" type="date" value={form.start_date || ''} onChange={handleChange} /></label>
        <label><span className={labelClass}>Estimated Hours</span><input className={inputClass} name="estimated_hours" type="number" value={form.estimated_hours || ''} onChange={handleChange} /></label>
        <label><span className={labelClass}>Project Version</span><input className={inputClass} name="version" value={form.version || ''} onChange={handleChange} /></label>
        <label><span className={labelClass}>Project Manager</span><input className={inputClass} name="project_manager" value={form.project_manager || ''} onChange={handleChange} /></label>
        <label className="md:col-span-2"><span className={labelClass}>Project Goals</span><textarea className={`${inputClass} min-h-24 resize-y`} name="goals" value={form.goals || ''} onChange={handleChange} /></label>
        <label className="md:col-span-2"><span className={labelClass}>Internal Notes</span><textarea className={`${inputClass} min-h-24 resize-y`} name="internal_notes" value={form.internal_notes || ''} onChange={handleChange} /></label>
        <div className="flex items-end justify-end gap-3 md:col-span-2"><Link to="/projects" className="rounded-xl border border-[#2b303b] bg-[#191d25] px-5 py-3 text-sm font-semibold text-[#C4C9D3]">Cancel</Link><button disabled={saving} className="rounded-xl bg-linear-to-br from-[#6d4aff] to-[#925cff] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button></div>
        {message && <p className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{message}</p>}
      </form>
    </div>
  );
}
