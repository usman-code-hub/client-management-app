import { useState, type ReactNode } from 'react';
import FormModal from '../components/common/FormModal.jsx';
import TestingForm from '../components/forms/TestingForm.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';

type RecordItem = { title?: string; status?: string; priority?: string; projectName?: string };

export default function Testing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data] = useState<RecordItem[]>([]);
  return <FixesPage title="Testing" description="QA test cases and validation" isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} data={data}><TestingForm /></FixesPage>;
}

export function FixesPage({ title, description, isModalOpen, setIsModalOpen, data = [], children }: { title: string; description: string; isModalOpen: boolean; setIsModalOpen: (open: boolean) => void; data?: RecordItem[]; children: ReactNode }) {
  return <div className="p-8 bg-[#0b0d12] min-h-screen text-white"><div className="flex justify-between items-center mb-8"><div><h1 className="text-3xl font-bold">{title}</h1><p className="text-gray-400 text-sm">{description}</p></div><button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-linear-to-br from-[#6d4aff] to-[#925cff] rounded-lg font-semibold">+ Add New</button></div><div className="bg-[#11141b] border border-[#242833] rounded-2xl overflow-hidden"><table className="w-full text-left"><thead><tr className="bg-[#161a23] text-gray-400 text-xs uppercase font-bold"><th className="px-6 py-4">Title</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Priority</th><th className="px-6 py-4">Project</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="text-sm divide-y divide-[#242833]">{data.length === 0 ? <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No records found. Click "Add New" to start.</td></tr> : data.map((item, index) => <tr key={index}><td className="px-6 py-4">{item.title}</td><td className="px-6 py-4"><StatusBadge status={item.status} /></td><td className="px-6 py-4">{item.priority}</td><td className="px-6 py-4">{item.projectName}</td><td className="px-6 py-4 text-right">Edit</td></tr>)}</tbody></table></div><FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add New ${title}`} description="Fill in the details to create a new record.">{children}</FormModal></div>;
}