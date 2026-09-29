
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import StatusBadge from "../components/common/StatusBadge";

const Projects = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const { data: result, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (!error) setData(result);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      window.alert(`Could not delete project: ${error.message}`);
      return;
    }
    setData((current) => current.filter((project) => project.id !== id));
  };

  return (
    <div className="p-8 bg-[#0b0d12] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-400 text-sm">Track ongoing CRM and Automation projects.</p>
        </div>
        <Link to="/projects/new" className="px-5 py-2.5 bg-gradient-to-br from-[#6d4aff] to-[#925cff] rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">+ Add Project</Link>
      </div>
      <div className="bg-[#11141b] border border-[#242833] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#161a23] text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Project Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Deadline</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#242833]">
            {data.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No projects found.</td></tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-[#1a1f29] transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{item.name}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-gray-400">{item.due_date || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/projects/${item.id}/edit`} className="text-gray-500 hover:text-white mr-3">Edit</Link>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Removed FormModal for new link */}
    </div>
  );
};
export default Projects;
