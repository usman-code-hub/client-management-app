import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '../services/tasks';
import { getClients } from '../services/clients';
import { getProjects } from '../services/projects';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/common/StatusBadge';
import TrackerWidget from '../components/TrackerWidget';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      window.alert(`Could not delete task: ${error.message}`);
      return;
    }
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  useEffect(() => {
    Promise.all([getTasks(), getClients(), getProjects()])
      .then(([taskRows, clientRows, projectRows]) => { setTasks(taskRows || []); setClients(clientRows || []); setProjects(projectRows || []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 bg-[#0b0d12] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-2">Tasks</h1>
      <Link to="/tasks/new" className="inline-block px-6 py-2 bg-gradient-to-r from-[#6d4aff] to-[#925cff] rounded-lg font-bold mb-6">+ Add Task</Link>
      <div className="bg-[#11141b] border border-[#242833] rounded-2xl p-6">
        <h3 className="font-bold mb-4">Task List ({tasks.length})</h3>
        {loading ? <p className="text-gray-500">Loading tasks...</p> : tasks.length === 0 ? <p className="text-gray-500">No tasks yet.</p> : tasks.map(t => {
          const project = projects.find((item) => item.id === t.project_id);
          const client = clients.find((item) => item.id === t.client_id || item.id === project?.client_id);
          return <div key={t.id} className="border-b border-[#242833] py-4">
            <div className="flex items-center justify-between gap-4 text-sm text-gray-300">
              <div className="min-w-0 flex-1"><div className="truncate">• {t.title}</div><div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500"><span><strong className="text-gray-400">Client:</strong> {client?.name || client?.company || 'Unassigned'}</span><span><strong className="text-gray-400">Project:</strong> {project?.name || 'Unassigned'}</span></div></div>
              <StatusBadge status={t.status} />
              <Link to={`/tasks/${t.id}/edit`} className="text-xs text-gray-400 hover:text-white">Edit</Link>
              <button onClick={() => handleDelete(t.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
            <TrackerWidget taskId={t.id} label={t.title || 'Task'} />
          </div>
        })}
      </div>
    </div>
  );
}
