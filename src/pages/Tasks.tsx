import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { getTasks } from '../services/tasks';
import KanbanTabs from '../components/KanbanTabs';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Forms from './Forms';

export default function Tasks() {
	const [list, setList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [formOpen, setFormOpen] = useState(false);

	async function loadTasks() {
		setLoading(true);
		try {
			setList(await getTasks());
		} catch {
			setList([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadTasks();
	}, []);

	return <div>
		<div className="mb-4 flex items-center justify-between gap-3">
			<h2 className="text-xl font-bold text-[#F8FAFC]">Tasks</h2>
			<button type="button" aria-expanded={formOpen} onClick={() => setFormOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7C3AED]">
				{formOpen ? <X size={16} /> : <Plus size={16} />}
				{formOpen ? 'Cancel' : 'Add task'}
			</button>
		</div>
		{formOpen && <div className="mb-6"><Forms fixedTab="tasks" onCancel={() => setFormOpen(false)} onCreated={async () => { setFormOpen(false); await loadTasks(); }} /></div>}
		<div className="flex gap-2 mb-4"><StatusBadge status="todo" /><StatusBadge status="in_progress" /><StatusBadge status="completed" /></div>
		{loading ? <p className="text-[#64748B]">Loading...</p> : <div className="grid gap-3">{list.map((task: any) => <div key={task.id} className="rounded-2xl border border-[#242936]/60 bg-gradient-to-br from-[#11141B] to-[#0f1118] p-4"><div className="font-medium text-[#F8FAFC]">{task.title || 'Untitled'}</div><div className="mt-2 flex items-center gap-3 text-xs text-[#C8D0DC]"><StatusBadge status={task.status || 'todo'} /><span>{task.priority || 'MEDIUM'}</span></div></div>)}</div>}
		<KanbanTabs />
	</div>;
}
