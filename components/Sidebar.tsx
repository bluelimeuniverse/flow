import React from 'react';
import { LayoutDashboard, Users, Send, Palette, GitFork, BarChart3, Settings, Server, Mail, ExternalLink, Inbox, Globe } from 'lucide-react';
import { View } from '../App';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, sub: 'Overview e metriche principali' },
    { id: View.WEBMAIL, label: 'Webmail', icon: Inbox, sub: 'Leggi e invia email' },
    { id: View.CRM, label: 'CRM & Contacts', icon: Users, sub: 'Gestione contatti e liste' },
    { id: View.CAMPAIGNS, label: 'Campaigns', icon: Send, sub: 'Campagne email attive e archivio' },
    { id: 'domains', label: 'Domain Studio', icon: Globe, sub: 'Gestione domini e DNS' },
    { id: 'mailboxes', label: 'Mailboxes', icon: Server, sub: 'Gestione caselle email' },
    { id: View.TEMPLATES, label: 'Templates', icon: Palette, sub: 'Modelli email personalizzabili' },
    { id: View.AUTOMATIONS, label: 'Automations', icon: GitFork, sub: 'Flow Builder e sequenze automatiche' },
    { id: View.ANALYTICS, label: 'Analytics', icon: BarChart3, sub: 'Report e statistiche dettagliate' },
    { id: View.SETTINGS, label: 'Settings', icon: Settings, sub: 'Configurazioni e integrazioni' },
  ];

  return (
    <div className="w-72 h-full bg-slate-800 border-r border-slate-700 flex flex-col shadow-2xl">
      {/* Logo Area */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">BlueLimeFlow</h2>
            <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">EMAIL MARKETING PLATFORM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
            >
              <Icon className={`h-5 w-5 mt-0.5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <div className="text-left">
                <span className={`block text-sm font-medium ${isActive ? 'text-blue-100' : ''}`}>{item.label}</span>
                <span className={`block text-[10px] mt-0.5 ${isActive ? 'text-blue-300/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
                  {item.sub}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Infrastructure Section */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/50 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Strumenti</div>

        <button
          onClick={() => onViewChange(View.MAILCOW)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activeView === View.MAILCOW ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-emerald-400'
            }`}
        >
          <div className={`w-2 h-2 rounded-full ${activeView === View.MAILCOW ? 'bg-emerald-400' : 'bg-emerald-500/50'}`} />
          Gestione Caselle
        </button>
      </div>
    </div>
  );
};