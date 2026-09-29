import React, { useState } from 'react';
import FormModal from '../components/common/FormModal';
import EnhancementForm from '../components/forms/EnhancementForm';
import StatusBadge from '../components/common/StatusBadge';

const Enhancements = () => {{
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]); // This will come from Supabase

  return (
    <div className="p-8 bg-[#0b0d12] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Enhancements</h1>
          <p className="text-gray-400 text-sm">Feature requests and improvements</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-br from-[#6d4aff] to-[#925cff] rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
        >
          + Add New
        </button>
      </div>

      <div className="bg-[#11141b] border border-[#242833] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#161a23] text-gray-400 text-xs uppercase font-bold">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#242833]">
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No records found. Click "Add New" to start.</td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#1a1f29] transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{item.title}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-gray-400">{item.priority}</td>
                  <td className="px-6 py-4 text-gray-400">{item.projectName}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white mr-3">Edit</button>
                    <button className="text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Enhancements" 
        description="Fill in the details to create a new record."
      >
        <EnhancementForm />
      </FormModal>
    </div>
  );
}};

export default Enhancements;
