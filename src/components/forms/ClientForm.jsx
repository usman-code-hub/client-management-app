
import React, { useState } from 'react';
import FormField from '../common/FormField';
import { supabase } from '../../lib/supabase';

const ClientForm = ({ initialData = {}, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    company: initialData.company || '',
    address: initialData.address || '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('clients').upsert({ 
        name: formData.name, 
        email: formData.email, 
        phone: formData.phone, 
        company: formData.company, 
        address: formData.address 
      });
      if (error) throw error;
      if (onSuccess) onSuccess();
      alert('Client saved!');
    } catch (err) { alert(err.message); }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
      <FormField label="Client Name" name="name" value={formData.name} onChange={handleChange} required fullWidth />
      <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      <FormField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
      <FormField label="Company" name="company" value={formData.company} onChange={handleChange} />
      <FormField label="Address" name="address" value={formData.address} onChange={handleChange} fullWidth />
      <div className="col-span-2 flex justify-end gap-3 mt-4">
         <button type="submit" className="px-6 py-2 bg-gradient-to-br from-[#6d4aff] to-[#925cff] text-white rounded-lg font-semibold">Save Client</button>
      </div>
    </form>
  );
};
export default ClientForm;
