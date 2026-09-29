import { useState, useEffect } from 'react'; import { getActivity } from '../services/activity';
export default function Activity() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getActivity().then((d:any) => { setList(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  return (<div>
    <h2 className="text-xl font-bold text-[#F8FAFC] mb-4">Activity</h2>
    <div className="flex gap-2 mb-4"><span className="text-xs px-2 py-1 rounded bg-[#151923] border border-[#242936]/60 text-[#C8D0DC]">LATEST</span></div>
    {loading ? <p className="text-[#64748B]">Loading...</p> : <div className="grid gap-3">{list.map((item:any) => <div key={item.id} className="rounded-2xl border border-[#242936]/60 bg-gradient-to-br from-[#11141B] to-[#0f1118] p-4"><div className="font-medium text-[#F8FAFC]">{item.action || 'Event'}</div><div className="text-xs text-[#C8D0DC]">{item.created_at || 'N/A'}</div></div>)}</div>}
    <form onSubmit={(e:any) => { e.preventDefault(); alert('Saved'); }} className="rounded-2xl p-5 bg-gradient-to-br from-[#11141B] to-[#0f1118] border border-[#242936]/60 mt-6"><label>Note <input type="text" className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[#0D1017] border border-[#242936] text-[#F8FAFC] text-xs" /></label><button type="submit" className="w-full mt-3 py-2 rounded-lg bg-[#8B5CF6] text-white font-bold">Save</button></form>
  </div>);
}
