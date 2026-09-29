import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { getProjects } from '../services/projects';
import Forms from './Forms';

export default function Projects() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  async function loadProjects() {
    setLoading(true);
    try {
      setList(await getProjects());
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  return <div>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xl font-bold text-[#F8FAFC]">Projects</h2>
      <button type="button" aria-expanded={formOpen} onClick={() => setFormOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7C3AED]">
        {formOpen ? <X size={16} /> : <Plus size={16} />}
        {formOpen ? 'Cancel' : 'Add project'}
      </button>
    </div>
    {formOpen && <div className="mb-6"><Forms fixedTab="projects" onCancel={() => setFormOpen(false)} onCreated={async () => { setFormOpen(false); await loadProjects(); }} /></div>}
    {loading ? <p className="text-[#64748B]">Loading...</p> : <div className="grid gap-3">{list.map((project: any) => <div key={project.id} className="rounded-2xl border border-[#242936]/60 bg-linear-to-br from-[#11141B] to-[#0f1118] p-4">{project.name || 'Untitled'}</div>)}</div>}
  </div>;
}