'use client';

interface InputMethodToggleProps {
  method: 'email' | 'phone';
  onMethodChange: (method: 'email' | 'phone') => void;
  className?: string;
  'data-testid'?: string;
}

export function InputMethodToggle({
  method,
  onMethodChange,
  className = '',
  'data-testid': testId,
}: InputMethodToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent, newMethod: 'email' | 'phone') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onMethodChange(newMethod);
    }
  };

  return (
    <div className={`flex bg-slate-700 rounded-full p-1 ${className}`} data-testid={testId}>
      <button
        type="button"
        onClick={() => onMethodChange('email')}
        onKeyDown={(e) => handleKeyDown(e, 'email')}
        className={`
          flex-1 py-3 px-4 text-base font-medium rounded-full transition-all duration-200 flex items-center justify-center space-x-2 min-h-[48px]
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1
          ${method === 'email'
            ? '!border-2 !border-cyan-500 !bg-slate-900 !text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-600'
          }
        `}
        data-testid={`${testId}-email`}
        role="tab"
        aria-selected={method === 'email'}
        tabIndex={method === 'email' ? 0 : -1}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Email</span>
      </button>
      
      <button
        type="button"
        onClick={() => onMethodChange('phone')}
        onKeyDown={(e) => handleKeyDown(e, 'phone')}
        className={`
          flex-1 py-3 px-4 text-base font-medium rounded-full transition-all duration-200 flex items-center justify-center space-x-2 min-h-[48px]
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1
          ${method === 'phone'
            ? '!border-2 !border-cyan-500 !bg-slate-900 !text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-600'
          }
        `}
        data-testid={`${testId}-phone`}
        role="tab"
        aria-selected={method === 'phone'}
        tabIndex={method === 'phone' ? 0 : -1}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>Phone</span>
      </button>
    </div>
  );
}