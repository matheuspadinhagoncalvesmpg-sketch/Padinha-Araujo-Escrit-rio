import React from 'react';

// Card
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

// Badge
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = ({ children, variant = 'default' }) => {
  const colors = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-green-50 text-green-800 border border-green-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-red-50 text-red-800 border border-red-200',
    info: 'bg-blue-50 text-blue-900 border border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
};

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
  
  // Customizing primary to match the dark navy brand
  const variants = {
    primary: "border-transparent text-white bg-[#0e1b2e] hover:bg-[#1e2e45] focus:ring-slate-500",
    secondary: "border-transparent text-slate-900 bg-slate-200 hover:bg-slate-300 focus:ring-slate-500",
    outline: "border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-slate-500",
    ghost: "border-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500 shadow-none",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="mb-2">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <input
      className={`shadow-sm focus:ring-[#0e1b2e] focus:border-[#0e1b2e] block w-full sm:text-sm border-slate-300 rounded-md p-2 border ${error ? 'border-red-500' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, className = '', ...props }) => (
  <div className="mb-2">
    {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
    <select
      className={`shadow-sm focus:ring-[#0e1b2e] focus:border-[#0e1b2e] block w-full sm:text-sm border-slate-300 rounded-md p-2 border ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

// Modal
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-slate-600 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start w-full">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl leading-6 font-serif text-[#0e1b2e]" id="modal-title">
                  {title}
                </h3>
                <div className="mt-4">
                  {children}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
