import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import StatusBadge from '../components/common/StatusBadge';

const Clients = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
    } else {
      setData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      return;
    }
    setData((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-8 bg-[#0b0d12] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-gray-400 text-sm">Manage your high-ticket clients and contact info.</p>
        </div>
        <Link
          to="/clients/new"
          className="px-5 py-2.5 bg-gradient-to-br from-[#6d4aff] to-[#925cff] rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
        >
          + Add Client
        </Link>
      </div>

      <div className="bg-[#11141b] border border-[#242833] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#161a23] text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#242833]">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No clients found.</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-[#1a1f29] transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-200">{item.company || item.name || '-'}</td>
                  <td className="px-6 py-4 text-gray-400">{item.contact_name || '-'}</td>
                  <td className="px-6 py-4 text-gray-400">{item.email || '-'}</td>
                  <td className="px-6 py-4 text-gray-400">{item.phone || '-'}</td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/clients/${item.id}/edit`} className="text-gray-500 hover:text-white mr-3">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;