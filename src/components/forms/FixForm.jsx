
import React, { useState } from 'react';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';
import { createFix, updateFix } from '../../services/fixes';

const FixForm = ({ initialData = {}, projects = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    projectId: initialData.projectId || '',
    source: initialData.source || 'Testing',
    priority: initialData.priority || 'Medium',
    status: initialData.status || 'Open',
    regressionRisk: initialData.regressionRisk || false,
    fixedVersion: initialData.fixedVersion || '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      project_id: formData.projectId || null,
      status: formData.status,
      priority: formData.priority,
      source: formData.source,
      regression_risk: formData.regressionRisk,
      fixed_version: formData.fixedVersion || null,
      problem: formData.problem,
      description: [formData.problem, formData.solution].filter(Boolean).join('\n\n'),
      root_cause: formData.rootCause || null
    };
    const { error } = initialData.id
      ? await updateFix(initialData.id, payload)
      : await createFix(payload);
    if (error) {
      window.alert(`Could not save fix: ${error.message}`);
      return;
    }
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
      <FormField label="Fix Title" name="title" value={formData.title} onChange={handleChange} required fullWidth />
      
      <SelectField label="Project" name="projectId" options={projects.map(project => ({ label: project.name || project.id, value: project.id }))} value={formData.projectId} onChange={handleChange} required />
      <SelectField label="Source" name="source" options={[ {label: 'Testing', value: 'Testing'}, {label: 'Client', value: 'Client'}, {label: 'QA', value: 'QA'} ]} value={formData.source} onChange={handleChange} />
      
      <SelectField label="Priority" name="priority" options={[ {label: 'Low', value: 'Low'}, {label: 'Medium', value: 'Medium'}, {label: 'High', value: 'High'}, {label: 'Critical', value: 'Critical'} ]} value={formData.priority} onChange={handleChange} />
      <SelectField label="Status" name="status" options={[ {label: 'Open', value: 'Open'}, {label: 'Resolved', value: 'Resolved'}, {label: 'Closed', value: 'Closed'} ]} value={formData.status} onChange={handleChange} />
      
      <FormField label="Fixed Version" name="fixedVersion" value={formData.fixedVersion} onChange={handleChange} placeholder="e.g. v1.0.2" />
      
      <div className="flex items-center gap-2 py-3">
        <input type="checkbox" name="regressionRisk" checked={formData.regressionRisk} onChange={handleChange} className="w-4 h-4 accent-[#7c5cff]" />
        <label className="text-xs font-semibold text-gray-300">High Regression Risk?</label>
      </div>

      <FormField label="Problem" name="problem" type="textarea" value={formData.problem} onChange={handleChange} required fullWidth />
      <FormField label="Root Cause" name="rootCause" type="textarea" value={formData.rootCause} onChange={handleChange} fullWidth />
      <FormField label="Solution" name="solution" type="textarea" value={formData.solution} onChange={handleChange} fullWidth />
      <div className="col-span-2 flex justify-end"><button type="submit" className="px-6 py-2 bg-gradient-to-br from-[#6d4aff] to-[#925cff] text-white rounded-lg font-semibold">Save Fix</button></div>
    </form>
  );
};

export default FixForm;
