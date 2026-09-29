import React, { useEffect, useState } from 'react';
import RequirementForm from '../components/forms/RequirementForm';
import FormModal from '../components/common/FormModal';
import { deleteRequirement, getRequirements } from '../services/requirements';
import { getClients } from '../services/clients';
import { getProjects } from '../services/projects';
import StatusBadge from '../components/common/StatusBadge';

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editingRequirement, setEditingRequirement] = useState(null);

  const refresh = async () => {
    const [requirementRows, clientRows, projectRows] = await Promise.all([getRequirements(), getClients(), getProjects()]);
    setRequirements(requirementRows);
    setClients(clientRows);
    setProjects(projectRows);
  };

  useEffect(() => { void refresh(); }, []);

  const openEdit = (requirement) => setEditingRequirement(requirement);
  const closeEdit = () => setEditingRequirement(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this requirement?')) return;
    const { error } = await deleteRequirement(id);
    if (error) {
      window.alert(`Could not delete requirement: ${error.message}`);
      return;
    }
    setRequirements(current => current.filter(requirement => requirement.id !== id));
  };

  return (
    <div className="p-8 bg-[#0b0d12] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-2">Requirements</h1>
      <p className="text-gray-400 mb-8">Client needs, acceptance criteria, and dependency tracking.</p>

      <div className="bg-[#11141b] border border-[#242833] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold mb-6">Add Requirement</h2>
        <RequirementForm clients={clients} projects={projects} onSuccess={refresh} />
      </div>

      {requirements.length > 0 && (
        <div className="mt-8 bg-[#11141b] border border-[#242833] rounded-2xl p-6">
          <h3 className="font-bold mb-4">Requirements ({requirements.length})</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            {requirements.map(item => (
              <li key={item.id} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate">• {item.title || 'Untitled requirement'}</div>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-300 xl:grid-cols-4">
                    <span><strong className="text-gray-500">Client:</strong> {clients.find(client => client.id === item.client_id)?.name || clients.find(client => client.id === item.client_id)?.company || 'Unassigned'}</span>
                    <span><strong className="text-gray-500">Project:</strong> {projects.find(project => project.id === item.project_id)?.name || 'Unassigned'}</span>
                    <span><strong className="text-gray-500">Priority:</strong> {item.priority || 'Medium'}</span>
                    <span><strong className="text-gray-500">Category:</strong> {item.category || 'Uncategorized'}</span>
                  </div>
                </div>
                <StatusBadge status={item.status} />
                <button type="button" onClick={() => openEdit(item)} className="text-xs text-gray-400 hover:text-white">Edit</button>
                <button type="button" onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormModal
        isOpen={Boolean(editingRequirement)}
        onClose={closeEdit}
        title="Edit Requirement"
        description="Update the requirement details."
      >
        <RequirementForm
          initialData={editingRequirement || {}}
          clients={clients}
          projects={projects}
          onSuccess={() => { closeEdit(); void refresh(); }}
        />
      </FormModal>
    </div>
  );
}
