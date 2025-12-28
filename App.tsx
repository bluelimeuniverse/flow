import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AutomationBuilder } from './components/AutomationBuilder';
import { CRM } from './components/CRM';
import { MailboxManager } from './components/MailboxManager';
import { DomainStudio } from './components/DomainStudio';
import { Campaigns } from './components/Campaigns';
import { Webmail } from './components/Webmail';
import { PaymentSuccess } from './components/PaymentSuccess';
import { StripeTest } from './components/StripeTest';
import { Menu } from 'lucide-react';

export enum View {
  DASHBOARD = 'dashboard',
  CRM = 'crm',
  CAMPAIGNS = 'campaigns',
  TEMPLATES = 'templates',
  AUTOMATIONS = 'automations',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  MAILCOW = 'mailcow', // Legacy?
  DOMAINS = 'domains',
  MAILBOXES = 'mailboxes',
  WEBMAIL = 'webmail',
  PAYMENT_SUCCESS = 'payment_success',
  STRIPE_TEST = 'stripe_test'
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentMailboxId, setCurrentMailboxId] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');

    // Check if URL ends with test-stripe
    if (window.location.href.includes('test-stripe')) {
      setActiveView(View.STRIPE_TEST);
    } else if (sid) {
      setPendingSessionId(sid);
      setActiveView(View.PAYMENT_SUCCESS);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOpenWebmail = (mailboxId: string) => {
    setCurrentMailboxId(mailboxId);
    setActiveView(View.WEBMAIL);
  };

  const renderContent = () => {
    switch (activeView) {
      case View.DASHBOARD:
        return <Dashboard onViewChange={setActiveView} />;
      case View.AUTOMATIONS:
        return <AutomationBuilder />;
      case View.CRM:
        return <CRM />;
      case View.MAILCOW:
        // Fallback or Legacy
        return <MailboxManager onOpenWebmail={handleOpenWebmail} />;
      case View.DOMAINS:
        return <DomainStudio />;
      case View.MAILBOXES:
        return <MailboxManager onOpenWebmail={handleOpenWebmail} />;
      case View.CAMPAIGNS:
        return <Campaigns />;
      case View.WEBMAIL:
        return <Webmail initialMailboxId={currentMailboxId} />;
      case View.PAYMENT_SUCCESS:
        return <PaymentSuccess sessionId={pendingSessionId || ''} onBack={() => setActiveView(View.DOMAINS)} />;
      case View.STRIPE_TEST:
        return <StripeTest />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-300">Modulo in sviluppo</h3>
              <p>Sto implementando la logica per {activeView}...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-slate-800 rounded-md border border-slate-700 text-slate-300"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 transition-transform duration-300 ease-in-out h-full`}>
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Top Bar (simplified) */}
        <header className="h-16 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4 md:ml-0 ml-12">
            <h1 className="text-xl font-bold text-white capitalize">
              {activeView === View.MAILCOW || activeView === View.DOMAINS ? 'Infrastructure & Mailboxes' : activeView.replace('_', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-400">System Operational</span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">smartlemon.net</p>
                <p className="text-xs text-slate-500">smartlemon.net@gmail.com</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold border-2 border-slate-800 shadow-lg shadow-blue-900/20">
                S
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-auto bg-slate-900 p-6 relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;