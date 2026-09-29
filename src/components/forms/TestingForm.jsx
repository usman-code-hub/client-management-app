
import React, { useState } from 'react';
import FormField from '../common/FormField';
import { supabase } from '../../lib/supabase';
import SelectField from '../common/SelectField';

const TestingForm = ({ initialData = {}, onSuccess, projects = [] }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    requirementId: initialData.requirementId || '',
    projectId: initialData.projectId || '',
    environment: initialData.environment || 'Production',
    browser: initialData.browser || 'Chrome',
    status: initialData.status || 'Not Started',
    fixId: initialData.fixId || '',
    retestDate: initialData.retestDate || '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <FormField label="Test Title" name="title" value={formData.title} onChange={handleChange} required fullWidth />
      
      <SelectField label="Project" name="projectId" options={projects.map(project => ({ label: project.name || project.id, value: project.id }))} value={formData.projectId} onChange={handleChange} required />
      <SelectField label="Requirement Link" name="requirementId" options={[ {label: 'Req 1: Lead Gen', value: 'req_1'} ]} value={formData.requirementId} onChange={handleChange} />
      
      <FormField label="Environment" name="environment" value={formData.environment} onChange={handleChange} placeholder="e.g. Staging" />
      <FormField label="Browser / Device" name="browser" value={formData.browser} onChange={handleChange} placeholder="e.g. Chrome/MacOS" />
      
      <SelectField label="Status" name="status" options={[
        {label: 'Not Started', value: 'Not Started'},
        {label: 'Testing', value: 'Testing'},
        {label: 'Passed', value: 'Passed'},
        {label: 'Failed', value: 'Failed'},
        {label: 'Review', value: 'Review'},
        {label: 'Pending', value: 'Pending'}
      ]} value={formData.status} onChange={handleChange} />
      
      <FormField label="Retest Date" name="retestDate" type="date" value={formData.retestDate} onChange={handleChange} />

      {formData.status === 'Failed' && (
        <div className="col-span-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col gap-3">
          <p className="text-xs text-red-400 font-semibold">⚠️ TEST FAILED: Link to a Fix or create a new one.</p>
          <SelectField label="Linked Fix" name="fixId" options={[ {label: 'Fix #101: API Error', value: 'fix_101'} ]} value={formData.fixId} onChange={handleChange} />
        </div>
      )}

      <FormField label="Test Steps" name="steps" type="textarea" value={formData.steps} onChange={handleChange} required fullWidth />
      <FormField label="Expected Result" name="expected" type="textarea" value={formData.expected} onChange={handleChange} required fullWidth />
      <FormField label="Actual Result" name="actual" type="textarea" value={formData.actual} onChange={handleChange} fullWidth />

      <div className="col-span-2 flex justify-end gap-3 mt-4">
        <button type="button" onClick={async () => {
          try {
            const description = [
              `Environment: ${formData.environment}`,
              `Browser / Device: ${formData.browser}`,
              `Test Steps:\n${formData.steps || ''}`,
              `Expected Result:\n${formData.expected || ''}`,
              `Actual Result:\n${formData.actual || ''}`,
              formData.requirementId ? `Requirement: ${formData.requirementId}` : '',
              formData.fixId ? `Linked Fix: ${formData.fixId}` : '',
              formData.retestDate ? `Retest Date: ${formData.retestDate}` : ''
            ].filter(Boolean).join('\n\n');
            const { error } = await supabase.from('test_cases').insert({
              title: formData.title,
              project_id: formData.projectId || null,
              status: formData.status.toUpperCase().replaceAll(' ', '_'),
              description
            });
            if (error) throw error;
            if (onSuccess) onSuccess();
            alert('Test saved!');
          } catch (e) { alert('Save error: ' + e.message); }
        }} className="px-6 py-2 bg-gradient-to-r from-[#6d4aff] to-[#925cff] text-white rounded-lg font-bold">Save Test</button>
      </div>
    </div>
  );
};

export default TestingForm;
