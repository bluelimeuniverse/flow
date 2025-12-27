import React, { useState, useEffect } from 'react';
import { Database, Lock, Code, Play, Check, AlertCircle } from 'lucide-react';

export const SupabaseDemo: React.FC = () => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [simulatedLoading, setSimulatedLoading] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  // Example code that implies how I would implement it
  const codeSnippet = `
import { createClient } from '@supabase/supabase-js';

// 1. Inizializzazione del client
// NOTA: In un ambiente reale, usa process.env
const supabaseUrl = '${url || 'https://tuo-project.supabase.co'}';
const supabaseKey = '${key ? 'HIDDEN_KEY' : 'tua-anon-key'}';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Esempio di funzione per recuperare dati
export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(10);
    
  if (error) throw error;
  return data;
};
`.trim();

  const handleSimulate = () => {
    setSimulatedLoading(true);
    setSimulatedSuccess(false);
    // Simulate async operation
    setTimeout(() => {
      setSimulatedLoading(false);
      setSimulatedSuccess(true);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl animate-fade-in space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">Integrazione Supabase</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Se mi fornisci le chiavi (o le imposti come variabili d'ambiente), posso scrivere l'intera logica di connessione.
          Ecco come strutturerei il codice per te.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Database className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Configurazione Simulatore</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Supabase URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Anon Public Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 text-slate-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSimulate}
                disabled={simulatedLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                  simulatedSuccess 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {simulatedLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : simulatedSuccess ? (
                  <>
                    <Check className="h-5 w-5" />
                    Codice Generato!
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Genera Client Code
                  </>
                )}
              </button>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-blue-300 leading-relaxed">
                  <strong>Nota di sicurezza:</strong> Come modello AI, non ho "memoria" tra le sessioni. 
                  Se mi dai le chiavi nel prompt, posso usarle per generare il codice funzionante immediatamente, 
                  ma è <em>best practice</em> chiedermi di usare <code>process.env</code> e tu inserirai le chiavi nel tuo file <code>.env</code> locale.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Preview Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono text-slate-400">src/lib/supabase.ts</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
          </div>
          <div className="p-4 overflow-auto flex-grow">
            <pre className="font-mono text-sm text-slate-300 leading-relaxed">
              <code dangerouslySetInnerHTML={{ 
                __html: codeSnippet
                  .replace(/const/g, '<span class="text-purple-400">const</span>')
                  .replace(/import/g, '<span class="text-purple-400">import</span>')
                  .replace(/from/g, '<span class="text-purple-400">from</span>')
                  .replace(/export/g, '<span class="text-purple-400">export</span>')
                  .replace(/async/g, '<span class="text-purple-400">async</span>')
                  .replace(/'[^']*'/g, match => `<span class="text-green-400">${match}</span>`)
                  .replace(/\/\/.*/g, match => `<span class="text-slate-500">${match}</span>`)
              }} />
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};