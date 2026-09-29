
import React, { useState } from 'react';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';
import { supabase } from '../../lib/supabase';

const ProjectForm = ({ initialData = {}, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    clientId: initialData.clientId || '',
    status: initialData.status || 'Planning',
    startDate: initialData.startDate || '',
    deadline: initialData.deadline || '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('projects').upsert({ 
        name: formData.name, 
        client_id: formData.clientId, 
        status: formData.status, 
        start_date: formData.startDate, 
        deadline: formData.deadline 
      });
      if (error) throw error;
      if (onSuccess) onSuccess();
      alert('Project saved!');
    } catch (err) { alert(err.message); }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
      <FormField label="Project Name" name="name" value={formData.name} onChange={handleChange} required fullWidth />
      <SelectField label="Client" name="clientId" options={[]} value={formData.clientId} onChange={handleChange} required />
      <SelectField label="Status" name="status" options={[{label: 'Planning', value: 'Planning'}, {label: 'Active', value: 'Active'}, {label: 'Completed', value: 'Completed'}]} value={formData.status} onChange={handleChange} />
      <FormField label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
      <FormField label="Deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
      <div className="col-span-2 flex justify-end gap-3 mt-4">
         <button type="submit" className="px-6 py-2 bg-gradient-to-br from-[#6d4aff] to-[#925cff] text-white rounded-lg font-semibold">Save Project</button>
      </div>
    </form>
  );
};
export default ProjectForm;
