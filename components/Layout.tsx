import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onClearSession: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onClearSession }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">ClauseCraft AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Visual Security Badge */}
             <div className="hidden md:flex px-3 py-1 bg-green-700/20 text-green-400 border border-green-700/30 text-xs font-medium rounded-full items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Secure Local Session
             </div>

             <button 
               onClick={onClearSession}
               className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20 px-3 py-1.5 rounded-lg"
             >
               End Session
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      <footer className="border-t border-slate-900 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} ClauseCraft AI. Secure, Offline-Style Processing. Data is redacted before analysis.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;