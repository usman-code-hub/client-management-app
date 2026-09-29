
import React, { useState } from 'react';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';
import { createRequirement, updateRequirement } from '../../services/requirements';

const RequirementForm = ({ initialData = {}, clients = [], projects = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    id: initialData.id,
    title: initialData.title || '',
    clientId: initialData.clientId || initialData.client_id || '',
    projectId: initialData.projectId || initialData.project_id || '',
    category: initialData.category || 'CRM',
    priority: initialData.priority || 'Medium',
    status: initialData.status || 'Pending',
    progress: initialData.progress || 0,
    description: initialData.description || '',
    acceptanceCriteria: initialData.acceptanceCriteria || '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      client_id: formData.clientId || null,
      project_id: formData.projectId || null,
      category: formData.category,
      priority: formData.priority,
      status: formData.status,
      progress: Number(formData.progress) || 0,
      due_date: formData.dueDate || formData.due_date || null,
      description: formData.description,
      acceptance_criteria: formData.acceptanceCriteria || formData.acceptance_criteria || null
    };
    const result = formData.id
      ? await updateRequirement(formData.id, payload)
      : await createRequirement(payload);
    if (result.error) {
      window.alert(`Could not save requirement: ${result.error.message}`);
      return;
    }
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
      <FormField label="Requirement Title" name="title" value={formData.title} onChange={handleChange} required fullWidth />
      
      <SelectField label="Client" name="clientId" options={clients.map(client => ({ label: client.name || client.company || client.id, value: client.id }))} value={formData.clientId} onChange={handleChange} required />
      <SelectField label="Project" name="projectId" options={projects.map(project => ({ label: project.name || project.id, value: project.id }))} value={formData.projectId} onChange={handleChange} required />
      
      <SelectField label="Category" name="category" options={[
        {label: 'CRM', value: 'CRM'},
        {label: 'Automation', value: 'Auto'},
        {label: 'Website', value: 'Website'},
        {label: 'Setup Lead Pipeline', value: 'Setup Lead Pipeline'},
        {label: 'Configure Calendar', value: 'Configure Calendar'},
        {label: 'WhatsApp Integration', value: 'WhatsApp Integration'},
        {label: 'Workflow Automation', value: 'Workflow Automation'},
        {label: 'AI Agents', value: 'AI Agents'},
        {label: 'Conversations', value: 'Conversations'},
        {label: 'AI Voice', value: 'AI Voice'},
        {label: 'Integrations', value: 'Integrations'},
        {label: 'Communities', value: 'Communities'},
        {label: 'Courses', value: 'Courses'},
        {label: 'Contacts', value: 'Contacts'},
        {label: 'Contact Fixes', value: 'Contact Fixes'},
        {label: 'Design', value: 'Design'},
        {label: 'Landing Page', value: 'Landing Page'},
        {label: 'Funnel', value: 'Funnel'}
      ]} value={formData.category} onChange={handleChange} />
      <SelectField label="Priority" name="priority" options={[ {label: 'Low', value: 'Low'}, {label: 'Medium', value: 'Medium'}, {label: 'High', value: 'High'}, {label: 'Critical', value: 'Critical'} ]} value={formData.priority} onChange={handleChange} />
      
      <SelectField label="Status" name="status" options={[ {label: 'Pending', value: 'Pending'}, {label: 'In Progress', value: 'In Progress'}, {label: 'Testing', value: 'Testing'}, {label: 'Review', value: 'Review'}, {label: 'Completed', value: 'Completed'} ]} value={formData.status} onChange={handleChange} />
      <FormField label="Progress %" name="progress" type="number" value={formData.progress} onChange={handleChange} />
      
      <FormField label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />

      <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} required fullWidth />
      <FormField label="Acceptance Criteria" name="acceptanceCriteria" type="textarea" value={formData.acceptanceCriteria} onChange={handleChange} fullWidth />
      <div className="col-span-2 flex justify-end"><button type="submit" className="px-6 py-2 bg-gradient-to-br from-[#6d4aff] to-[#925cff] text-white rounded-lg font-semibold">Save Requirement</button></div>
    </form>
  );
};

export default RequirementForm;
