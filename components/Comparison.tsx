import React from 'react';
import { MonitorPlay, FileCode2, BrainCircuit, Hammer, Github, FileText, AlertTriangle, GitMerge, Download, Rocket } from 'lucide-react';

export const Comparison: React.FC = () => {
  return (
    <div className="w-full max-w-6xl animate-fade-in py-6 space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Analisi per Progetti Complessi</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Per progetti "impegnativi", non devi scegliere. La strategia vincente è un <strong>Workflow Ibrido</strong>.
        </p>
      </div>

      {/* Workflow Section - NEW */}
      <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
          <GitMerge className="h-6 w-6 text-indigo-400" />
          Workflow Consigliato: "Da Zero a Produzione"
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 z-0" />

          {/* Step 1 */}
          <div className="relative z-10 bg-slate-900 border border-slate-700 p-6 rounded-xl hover:border-indigo-500 transition-colors">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-indigo-500/30 mx-auto md:mx-0">1</div>
            <h4 className="text-lg font-semibold text-white mb-2">Architecting (Qui)</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Usa questa chat per definire la struttura. Incolla i requisiti, fammi creare i componenti React, il routing, e lo stile Tailwind.
              <br/><span className="text-indigo-400 font-medium text-xs mt-2 block">Vantaggio: Velocità strutturale</span>
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 bg-slate-900 border border-slate-700 p-6 rounded-xl hover:border-teal-500 transition-colors">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-teal-500/30 mx-auto md:mx-0">2</div>
            <h4 className="text-lg font-semibold text-white mb-2">Export & Setup</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Copia i file generati nel tuo VS Code locale. Esegui <code>npm install</code>. Configura le variabili d'ambiente reali (.env) per Supabase.
              <br/><span className="text-teal-400 font-medium text-xs mt-2 block">Vantaggio: Ambiente reale</span>
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 bg-slate-900 border border-slate-700 p-6 rounded-xl hover:border-blue-500 transition-colors">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-blue-500/30 mx-auto md:mx-0">3</div>
            <h4 className="text-lg font-semibold text-white mb-2">Refining (Copilot)</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Usa GitHub Copilot in VS Code per scrivere logiche specifiche di backend, test unitari complessi e debugging riga per riga.
              <br/><span className="text-blue-400 font-medium text-xs mt-2 block">Vantaggio: Dettaglio fine</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Me (The Agent) */}
        <div className="group relative bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-8 hover:bg-indigo-950/30 transition-all duration-300">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-indigo-500/50 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
             <BrainCircuit className="h-8 w-8 text-indigo-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-center text-white mt-6 mb-2">AI Architect (Io)</h3>
          <p className="text-center text-indigo-200 text-sm mb-8 font-medium">PUNTI DI FORZA</p>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-indigo-500/20 rounded-full">
                <MonitorPlay className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <strong className="text-slate-200 block">Visione Olistica</strong>
                <span className="text-slate-400 text-sm">Posso rifare l'intera UI se decidi di cambiare design system, cosa difficile da fare "riga per riga".</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-indigo-500/20 rounded-full">
                <MonitorPlay className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <strong className="text-slate-200 block">Setup da Zero</strong>
                <span className="text-slate-400 text-sm">Ottimo per creare lo scheletro del progetto, le interfacce TypeScript e la struttura delle cartelle.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Copilot (The Assistant) */}
        <div className="group relative bg-slate-800/20 border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/30 transition-all duration-300">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-600 p-3 rounded-xl shadow-lg">
             <FileCode2 className="h-8 w-8 text-slate-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-center text-white mt-6 mb-2">IDE Assistant (Copilot)</h3>
          <p className="text-center text-slate-400 text-sm mb-8 font-medium">PUNTI DI FORZA</p>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-slate-700/50 rounded-full">
                <Hammer className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <strong className="text-slate-200 block">Progetti Massivi</strong>
                <span className="text-slate-400 text-sm">Se hai 500 file, Copilot li indicizza localmente. Io ho un limite di contesto (token) per volta.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-slate-700/50 rounded-full">
                <Hammer className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <strong className="text-slate-200 block">Dipendenze Reali</strong>
                <span className="text-slate-400 text-sm">Copilot vede i tuoi <code>node_modules</code> installati e le versioni esatte delle librerie.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-6 border-t border-slate-800 pt-8">
        <h3 className="text-xl font-bold text-white">Cosa inviarmi per iniziare (Input)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-red-500/20 p-6 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-400 font-semibold">
              <AlertTriangle className="h-5 w-5" />
              <span>Limitazioni Tecniche</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                Non leggo file <strong>.zip</strong> o cartelle intere
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                Non ho accesso a Internet (quindi niente link GitHub)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                Non ho "memoria" persistente tra sessioni diverse (se ricarichi la pagina)
              </li>
            </ul>
          </div>

          <div className="bg-indigo-900/10 border border-green-500/20 p-6 rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-green-400 font-semibold">
              <Rocket className="h-5 w-5" />
              <span>Input Ottimale</span>
            </div>
            <p className="text-sm text-slate-300">
              Il metodo migliore è il <strong>Copia & Incolla Testuale</strong> mirato.
            </p>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono text-slate-400">
              "Ecco il file App.tsx e Types.ts. Voglio aggiungere una feature che..."
            </div>
            <p className="text-xs text-slate-500 mt-auto">
              Se prepari bene il testo del prompt, posso fare miracoli anche su progetti complessi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};