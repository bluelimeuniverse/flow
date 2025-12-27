import React from 'react';
import { Terminal, Database, SplitSquareVertical, Code2, Mails, Network } from 'lucide-react';

export enum Section {
  HOME = 'home',
  SAAS_BLUEPRINT = 'saas_blueprint',
  SUPABASE = 'supabase',
  MAILCOW = 'mailcow',
  VSCODE = 'vscode'
}

interface HeaderProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate }) => {
  const navItems = [
    { id: Section.HOME, label: 'Overview', icon: Terminal },
    { id: Section.SAAS_BLUEPRINT, label: 'SaaS Architecture', icon: Network },
    { id: Section.SUPABASE, label: 'Supabase Auth', icon: Database },
    { id: Section.MAILCOW, label: 'Mailcow & Mktg', icon: Mails },
    { id: Section.VSCODE, label: 'Workflow', icon: SplitSquareVertical },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(Section.HOME)}>
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
              AI Engineer
            </span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : ''}`} />
                  <span className={item.id !== Section.HOME ? 'hidden md:inline' : ''}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};