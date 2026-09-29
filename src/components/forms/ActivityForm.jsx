
import React, { useState } from 'react';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';

const ActivityForm = ({ initialData = {} }) => {
  const [formData, setFormData] = useState({
    type: initialData.type || '',
    clientId: initialData.clientId || '',
    projectId: initialData.projectId || '',
    title: initialData.title || '',
    description: initialData.description || '',
    entityType: initialData.entityType || '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <SelectField label="Activity Type" name="type" options={[ 
        {label: 'Note', value: 'Note'}, 
        {label: 'Meeting', value: 'Meeting'}, 
        {label: 'Call', value: 'Call'}, 
        {label: 'Email', value: 'Email'},
        {label: 'Client Update', value: 'Update'}
      ]} value={formData.type} onChange={handleChange} required />
      
      <SelectField label="Client" name="clientId" options={[ {label: 'ABC Fitness', value: '1'} ]} value={formData.clientId} onChange={handleChange} />
      <SelectField label="Project" name="projectId" options={[ {label: 'GHL Setup', value: '1'} ]} value={formData.projectId} onChange={handleChange} />
      
      <SelectField label="Related Entity" name="entityType" options={[ 
        {label: 'Task', value: 'Task'}, 
        {label: 'Requirement', value: 'Req'}, 
        {label: 'Test', value: 'Test'}, 
        {label: 'Fix', value: 'Fix'} 
      ]} value={formData.entityType} onChange={handleChange} />
      <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} />

      <FormField label="Activity Title" name="title" value={formData.title} onChange={handleChange} required fullWidth />
      <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} required fullWidth />
      <FormField label="Attachment Link" name="link" value={formData.link} onChange={handleChange} placeholder="https://..." fullWidth />
    </div>
  );
};

export default ActivityForm;
