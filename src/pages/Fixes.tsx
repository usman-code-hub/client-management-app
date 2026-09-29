import { useEffect, useState } from 'react';
import FixForm from '../components/forms/FixForm.jsx';
import FormModal from '../components/common/FormModal.jsx';
import { deleteFix, getFixes } from '../services/fixes';
import { getClients } from '../services/clients';
import { getProjects } from '../services/projects';
import StatusBadge from '../components/common/StatusBadge.jsx';

export default function Fixes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fixes, setFixes] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [editingFix, setEditingFix] = useState<any>(null);

  async function refresh() {
    const [fixRows, projectRows, clientRows] = await Promise.all([getFixes(), getProjects(), getClients()]);
    setFixes(fixRows as any[]);
    setProjects(projectRows as any[]);
    setClients(clientRows as any[]);
  }

  useEffect(() => { void refresh(); }, []);

  function openCreate() {
    setEditingFix(null);
    setIsModalOpen(true);
  }

  function openEdit(fix:any) {
    const solution = fix.description && fix.problem && fix.description.startsWith(fix.problem)
      ? fix.description.slice(fix.problem.length).trim()
      : fix.description || '';
    setEditingFix({
      ...fix,
      projectId: fix.project_id || '',
      fixedVersion: fix.fixed_version || '',
      regressionRisk: fix.regression_risk || false,
      rootCause: fix.root_cause || '',
      problem: fix.problem || '',
      solution
    });
    setIsModalOpen(true);
  }

  async function handleDelete(id:string) {
    if (!window.confirm('Delete this fix?')) return;
    const { error } = await deleteFix(id);
    if (error) {
      window.alert(`Could not delete fix: ${error.message}`);
      return;
    }
    setFixes((current) => current.filter((fix) => fix.id !== id));
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingFix(null);
  }

  return <div className="p-8 bg-[#0b0d12] min-h-screen text-white">
    <div className="flex justify-between items-center mb-8">
      <div><h1 className="text-3xl font-bold">Fixes</h1><p className="text-gray-400 text-sm">Bug tracking and resolution</p></div>
      <button onClick={openCreate} className="px-5 py-2.5 bg-linear-to-br from-[#6d4aff] to-[#925cff] rounded-lg font-semibold">+ Add Fix</button>
    </div>
    <div className="bg-[#11141b] border border-[#242833] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-[#242833]"><h2 className="font-bold">Fixes ({fixes.length})</h2></div>
      {fixes.length === 0 ? <p className="px-6 py-10 text-center text-gray-500">No fixes found.</p> : <div className="divide-y divide-[#242833]">
        {fixes.map((fix) => {
          const project = projects.find((item) => item.id === fix.project_id);
          const client = clients.find((item) => item.id === project?.client_id);
          return <div key={fix.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#151923]">
            <div className="min-w-0 flex-1"><div className="flex items-center gap-3"><strong className="truncate">{fix.title || 'Untitled fix'}</strong><StatusBadge status={fix.status} /></div><p className="mt-1 text-xs text-gray-500">Project: {project?.name || 'Unassigned'} · Client: {client?.name || client?.company || 'Unassigned'}</p><p className="mt-1 text-xs text-gray-500 truncate">{fix.description || 'No description'}</p></div>
            <button onClick={() => openEdit(fix)} className="text-xs text-gray-400 hover:text-white">Edit</button>
            <button onClick={() => handleDelete(fix.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
          </div>;
        })}
      </div>}
    </div>
    <FormModal isOpen={isModalOpen} onClose={closeModal} title={editingFix ? 'Edit Fix' : 'Add Fix'} description={editingFix ? 'Update the fix details.' : 'Record a bug fix and its resolution.'}>
      <FixForm initialData={editingFix || {}} projects={projects} onSuccess={() => { closeModal(); void refresh(); }} />
    </FormModal>
  </div>;
}