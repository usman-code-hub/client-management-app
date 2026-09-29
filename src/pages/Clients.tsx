import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { getClients } from '../services/clients';
import Forms from './Forms';

export default function Clients() {
	const [list, setList] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [formOpen, setFormOpen] = useState(false);

	async function loadClients() {
		setLoading(true);
		try {
			setList(await getClients());
		} catch {
			setList([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadClients();
	}, []);

	return (
		<div>
			<div className="mb-4 flex items-center justify-between gap-3">
				<h2 className="text-xl font-bold text-[#F8FAFC]">Clients</h2>
				<button type="button" aria-expanded={formOpen} onClick={() => setFormOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7C3AED]">
					{formOpen ? <X size={16} /> : <Plus size={16} />}
					{formOpen ? 'Cancel' : 'Add client'}
				</button>
			</div>
			{formOpen && <div className="mb-6"><Forms fixedTab="clients" onCancel={() => setFormOpen(false)} onCreated={async () => { setFormOpen(false); await loadClients(); }} /></div>}
			{loading ? <p className="text-[#64748B]">Loading...</p> : (
				<div className="grid gap-3">
					{list.map((client: any) => (
						<div key={client.id} className="rounded-2xl border border-[#242936]/60 bg-gradient-to-br from-[#11141B] to-[#0f1118] p-4">
							{client.name || 'Untitled'}
						</div>
					))}
				</div>
			)}
		</div>
	);
}