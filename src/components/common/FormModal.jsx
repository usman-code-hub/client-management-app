
import React from 'react';

const FormModal = ({ isOpen, onClose, title, description, children, onSubmitText = 'Submit' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#11141b] border border-[#242833] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#242833] flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-2xl">&times;</button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        <div className="p-6 border-t border-[#242833] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-[#191d25] border border-[#2b303b] rounded-lg hover:bg-[#20242d] transition-all">
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-br from-[#6d4aff] to-[#925cff] rounded-lg hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
            {onSubmitText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
