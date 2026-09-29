import { useState } from 'react';
export default function KanbanTabs() {
  const [tab, setTab] = useState('todo');
  const data: Record<string, any[]> = {
    todo: [{ title: 'Setup workflow', date: 'Sep 23', span: '2 days' }],
    inprogress: [{ title: 'Build automation', date: 'Sep 22', span: '3 days' }],
    review: [{ title: 'QA checks', date: 'Sep 24', span: '1 day' }],
    completed: [{ title: 'Client setup', date: 'Sep 20', span: '5 days' }],
  };
  return (
    <div className="rounded-2xl border border-[#242936]/60 bg-gradient-to-br from-[#11141B] to-[#0f1118] p-5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]">
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['todo','inprogress','review','completed'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? 'bg-[#8B5CF6] text-white' : 'bg-[#151923] text-[#94A3B8]'}`}>{t}</button>
        ))}
      </div>
      <div className="space-y-2">
        {data[tab].map((item, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#0D1017] border border-[#242936]/40">
            <div>
              <div className="text-sm font-semibold text-[#F8FAFC]">{item.title}</div>
              <div className="text-xs text-[#64748B]">{item.date} · {item.span}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
