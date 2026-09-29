import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getClients } from '../services/clients';
import { getFixes } from '../services/fixes';
import { getProjects } from '../services/projects';
import { getRequirements } from '../services/requirements';
import { getTasks } from '../services/tasks';

const activityName = (item, related) => {
  const type = String(item.entity_type || '').toLowerCase();
  const records = type.includes('client') ? related.clients : type.includes('project') ? related.projects : type.includes('task') ? related.tasks : type.includes('requirement') ? related.requirements : type.includes('fix') ? related.fixes : [];
  const record = records.find((entry) => entry.id === item.entity_id);
  return record?.name || record?.title || record?.company || item.entity_type || 'Record';
};

const Activity = () => {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ action: 'Note', entity_type: 'General', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [related, setRelated] = useState({ clients: [], projects: [], tasks: [], requirements: [], fixes: [] });

  const fetchData = async () => {
    setLoading(true);
    const [{ data: rows, error }, clients, projects, tasks, requirements, fixes] = await Promise.all([
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }),
      getClients(), getProjects(), getTasks(), getRequirements(), getFixes()
    ]);
    setRelated({ clients, projects, tasks, requirements, fixes });
    if (error) setMessage(error.message);
    else setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { void fetchData(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.description.trim()) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('activity_logs').insert(form);
    if (error) setMessage(`Could not save activity: ${error.message}`);
    else {
      setForm({ action: 'Note', entity_type: 'General', description: '' });
      await fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity entry?')) return;
    const { error } = await supabase.from('activity_logs').delete().eq('id', id);
    if (error) setMessage(`Could not delete activity: ${error.message}`);
    else setData((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="p-8 bg-[#0b0d12] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-gray-400 text-sm">Project timeline and audit trail</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-[#242833] bg-[#11141b] p-6 md:grid-cols-[180px_180px_1fr_auto] md:items-end">
        <label><span className="mb-2 block text-xs font-semibold uppercase text-gray-400">Type</span><select className="w-full rounded-lg border border-[#292e39] bg-[#0b0e14] px-3 py-2.5 text-sm" value={form.action} onChange={(event) => setForm({ ...form, action: event.target.value })}><option>Note</option><option>Update</option><option>System</option><option>Created</option></select></label>
        <label><span className="mb-2 block text-xs font-semibold uppercase text-gray-400">Entity</span><select className="w-full rounded-lg border border-[#292e39] bg-[#0b0e14] px-3 py-2.5 text-sm" value={form.entity_type} onChange={(event) => setForm({ ...form, entity_type: event.target.value })}><option>General</option><option>Client</option><option>Project</option><option>Task</option></select></label>
        <label><span className="mb-2 block text-xs font-semibold uppercase text-gray-400">Description</span><input required className="w-full rounded-lg border border-[#292e39] bg-[#0b0e14] px-3 py-2.5 text-sm" placeholder="Describe the activity..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <button disabled={saving} className="rounded-lg bg-gradient-to-br from-[#6d4aff] to-[#925cff] px-5 py-2.5 font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Add Activity'}</button>
      </form>
      {message && <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{message}</p>}
      <div className="bg-[#11141b] border border-[#242833] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#161a23] text-gray-400 text-xs uppercase font-bold">
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Entity</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#242833]">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">Loading activity...</td></tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No activity recorded yet. Add an activity above to start.</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-[#1a1f29] transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{item.action || '-'}</td>
                  <td className="px-6 py-4 text-gray-400">{item.entity_type || '-'}</td>
                  <td className="px-6 py-4 text-gray-400">{item.description || `${item.entity_type || 'Record'}: ${activityName(item, related)}`}</td>
                  <td className="px-6 py-4 text-gray-400">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Activity;
