import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const inputClass = 'w-full rounded-xl border border-[#292e39] bg-[#0b0e14] px-3.5 py-3 text-sm text-[#F5F7FB] outline-none transition focus:border-[#7957ff] focus:ring-4 focus:ring-[#7957ff]/10';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wide text-[#C8D0DC]';

export default function ClientEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', company: '', email: '', platform: '', status: 'Active' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadClient() {
      if (!id) return;
      const { data, error } = await supabase.from('clients').select('name, company, email, platform, status').eq('id', id).single();
      if (error) setMessage(error.message);
      else if (data) setForm({ name: data.name || '', company: data.company || '', email: data.email || '', platform: data.platform || '', status: data.status || 'Active' });
      setLoading(false);
    }
    void loadClient();
  }, [id]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('clients').update(form).eq('id', id);
    if (error) {
      setMessage(`Could not update client: ${error.message}`);
      setSaving(false);
      return;
    }
    navigate('/clients');
  }

  if (loading) return <div className="p-8 text-gray-400">Loading client...</div>;

  return (
    <div className="max-w-4xl p-8 text-white">
      <Link to="/clients" className="text-sm text-[#A78BFA] hover:text-white">Back to Clients</Link>
      <h1 className="mt-4 text-3xl font-bold">Edit Client</h1>
      <p className="mt-2 text-sm text-gray-400">Update the client information stored in Supabase.</p>
      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-5 rounded-2xl border border-[#242936]/70 bg-linear-to-br from-[#11141B] to-[#0f1118] p-6 md:grid-cols-2">
        <label><span className={labelClass}>Client Name</span><input className={inputClass} name="name" value={form.name} onChange={handleChange} required /></label>
        <label><span className={labelClass}>Company</span><input className={inputClass} name="company" value={form.company} onChange={handleChange} /></label>
        <label><span className={labelClass}>Email</span><input className={inputClass} name="email" type="email" value={form.email} onChange={handleChange} /></label>
        <label><span className={labelClass}>Industry / Platform</span><input className={inputClass} name="platform" value={form.platform} onChange={handleChange} /></label>
        <label><span className={labelClass}>Status</span><select className={inputClass} name="status" value={form.status} onChange={handleChange}><option>Active</option><option>Prospect</option><option>On Hold</option><option>Completed</option><option>Archived</option></select></label>
        <div className="flex items-end justify-end gap-3 md:col-span-2"><Link to="/clients" className="rounded-xl border border-[#2b303b] bg-[#191d25] px-5 py-3 text-sm font-semibold text-[#C4C9D3]">Cancel</Link><button disabled={saving} className="rounded-xl bg-linear-to-br from-[#6d4aff] to-[#925cff] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button></div>
        {message && <p className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{message}</p>}
      </form>
    </div>
  );
}
