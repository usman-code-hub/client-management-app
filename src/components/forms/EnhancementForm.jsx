
import React, { useState } from 'react';
import FormField from '../common/FormField';
import SelectField from '../common/SelectField';

const EnhancementForm = ({ initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    clientId: initialData.clientId || '',
    type: initialData.type || 'Improvement',
    priority: initialData.priority || 'Medium',
    approvalStatus: initialData.approvalStatus || 'Requested',
    impact: initialData.impact || 'Medium',
    effort: initialData.effort || '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <FormField label="Enhancement Title" name="title" value={formData.title} onChange={handleChange} required fullWidth />
      
      <SelectField label="Client" name="clientId" options={[ {label: 'ABC Fitness', value: '1'} ]} value={formData.clientId} onChange={handleChange} required />
      <SelectField label="Type" name="type" options={[ {label: 'New Feature', value: 'Feature'}, {label: 'Improvement', value: 'Improve'} ]} value={formData.type} onChange={handleChange} />
      
      <SelectField label="Approval Status" name="approvalStatus" options={[ 
        {label: 'Requested', value: 'Requested'}, 
        {label: 'Approved', value: 'Approved'}, 
        {label: 'Rejected', value: 'Rejected'} 
      ]} value={formData.approvalStatus} onChange={handleChange} />
      
      <SelectField label="Impact Level" name="impact" options={[ {label: 'Low', value: 'Low'}, {label: 'Medium', value: 'Medium'}, {label: 'High', value: 'High'} ]} value={formData.impact} onChange={handleChange} />
      
      <FormField label="Estimated Effort" name="effort" value={formData.effort} onChange={handleChange} placeholder="e.g. 5 hours" />
      <FormField label="Version/Release" name="version" value={formData.version} onChange={handleChange} placeholder="v1.1" />

      <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} required fullWidth />
      <FormField label="Business Value" name="businessValue" type="textarea" value={formData.businessValue} onChange={handleChange} fullWidth />
    </div>
  );
};

export default EnhancementForm;
