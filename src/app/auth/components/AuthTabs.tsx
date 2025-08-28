'use client';

interface AuthTabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
  className?: string;
  'data-testid'?: string;
}

export function AuthTabs({
  activeTab,
  onTabChange,
  className = '',
  'data-testid': testId,
}: AuthTabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, tab: 'login' | 'register') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tab);
    }
  };

  return (
    <div className={`flex bg-slate-700 rounded-full p-1 mb-6 ${className}`} data-testid={testId}>
      <button
        type="button"
        onClick={() => onTabChange('login')}
        onKeyDown={(e) => handleKeyDown(e, 'login')}
        className={`
          flex-1 py-3 px-6 text-base font-medium rounded-full transition-all duration-200 min-h-[48px]
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
          ${activeTab === 'login'
            ? '!border-2 !border-orange-500 !bg-slate-900 !text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-600'
          }
        `}
        data-testid={`${testId}-login`}
        role="tab"
        aria-selected={activeTab === 'login'}
        tabIndex={activeTab === 'login' ? 0 : -1}
      >
        Sign In
      </button>
      
      <button
        type="button"
        onClick={() => onTabChange('register')}
        onKeyDown={(e) => handleKeyDown(e, 'register')}
        className={`
          flex-1 py-3 px-6 text-base font-medium rounded-full transition-all duration-200 min-h-[48px]
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
          ${activeTab === 'register'
            ? '!border-2 !border-orange-500 !bg-slate-900 !text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-600'
          }
        `}
        data-testid={`${testId}-register`}
        role="tab"
        aria-selected={activeTab === 'register'}
        tabIndex={activeTab === 'register' ? 0 : -1}
      >
        Register
      </button>
    </div>
  );
}