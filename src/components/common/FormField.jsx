
import React from 'react';

const FormField = ({ label, name, type = 'text', placeholder, value, onChange, required = false, fullWidth = false, ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'col-span-2' : ''}`}>
      <label className="text-xs font-semibold text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-[#0b0e14] border border-[#292e39] text-white rounded-lg px-4 py-2.5 outline-none focus:border-[#7957ff] focus:ring-2 focus:ring-[#7957ff]/10 transition-all placeholder:text-gray-600"
        {...props}
      />
    </div>
  );
};

export default FormField;
