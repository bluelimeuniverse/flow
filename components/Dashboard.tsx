import React from 'react';
import { Users, Mail, MousePointerClick, TrendingUp, Server, Database, ShieldCheck, Lock } from 'lucide-react';
import { View } from '../App';

interface DashboardProps {
    onViewChange: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-3 h-8 bg-blue-500 rounded-sm"></div>
            Dashboard Overview
          </h2>
          <p className="text-slate-400 mt-1">Welcome back! Here's what's happening with your email marketing.</p>
        </div>
        <div className="flex gap-3">
             <select className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500">
                 <option>Last 7 days</option>
                 <option>Last 30 days</option>
                 <option>This Quarter</option>
             </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <Users className="h-6 w-6" />
                </div>
                <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded">+8.2%</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">12,547</h3>
            <p className="text-slate-400 text-sm">Total Contacts</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <Mail className="h-6 w-6" />
                </div>
                <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded">+3</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">23</h3>
            <p className="text-slate-400 text-sm">Active Campaigns</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <TrendingUp className="h-6 w-6" />
                </div>
                <span className="bg-green-500/10 text-green-400 text-xs font-bold px-2 py-1 rounded">+2.1%</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">24.6%</h3>
            <p className="text-slate-400 text-sm">Open Rate</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                    <MousePointerClick className="h-6 w-6" />
                </div>
                <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded">-0.3%</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">3.8%</h3>
            <p className="text-slate-400 text-sm">Click Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-xl">🚀</span> Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => onViewChange(View.CAMPAIGNS)} className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-lg text-left transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded text-blue-400 group-hover:scale-110 transition-transform">
                             <Mail className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-white">Create Campaign</span>
                    </div>
                    <p className="text-xs text-slate-400">Start a new email campaign</p>
                </button>

                <button onClick={() => onViewChange(View.CRM)} className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-purple-500 rounded-lg text-left transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded text-purple-400 group-hover:scale-110 transition-transform">
                             <Database className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-white">Import Contacts</span>
                    </div>
                    <p className="text-xs text-slate-400">Add new contacts to your CRM</p>
                </button>

                <button onClick={() => onViewChange(View.AUTOMATIONS)} className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-indigo-500 rounded-lg text-left transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/20 rounded text-indigo-400 group-hover:scale-110 transition-transform">
                             <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-white">Build Automation</span>
                    </div>
                    <p className="text-xs text-slate-400">Create automated email sequences</p>
                </button>

                <button onClick={() => onViewChange(View.ANALYTICS)} className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-emerald-500 rounded-lg text-left transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded text-emerald-400 group-hover:scale-110 transition-transform">
                             <Users className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-white">View Reports</span>
                    </div>
                    <p className="text-xs text-slate-400">Analyze performance metrics</p>
                </button>
            </div>
        </div>

        {/* System Status */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Server className="h-5 w-5 text-slate-400" /> System Status
            </h3>
            
            <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-1 rounded">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-300">Backend</span>
                    </div>
                    <span className="text-xs text-green-400 font-mono">Online</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-1 rounded">
                             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-300">Supabase</span>
                    </div>
                    <span className="text-xs text-green-400 font-mono">Connected</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                         <div className="bg-blue-500/20 p-1 rounded">
                             <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-300">Mailcow</span>
                    </div>
                    <span className="text-xs text-green-400 font-mono">Ready</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-1 rounded">
                             <Lock className="w-3 h-3 text-amber-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">Auth</span>
                    </div>
                    <span className="text-xs text-green-400 font-mono">Active</span>
                </div>
            </div>

            <div className="mt-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                All systems operational
            </div>
        </div>
      </div>
    </div>
  );
};