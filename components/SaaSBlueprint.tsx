import React from 'react';
import { User, Database, ShieldCheck, Mail, Globe, CreditCard, Server, ArrowRight, Lock, Zap } from 'lucide-react';

export const SaaSBlueprint: React.FC = () => {
  return (
    <div className="w-full max-w-6xl animate-fade-in space-y-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 backdrop-blur-xl mb-4">
          <Zap className="h-4 w-4 mr-2" />
          Architettura Scalabile
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Il tuo SaaS di Email Marketing</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          Ecco la mappa esatta di come gestire <strong>migliaia di utenti</strong>. Io posso scrivere il codice per tutti questi 4 blocchi.
          La complessità non sta nel volume degli utenti, ma nella corretta separazione dei ruoli.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
        {/* Connecting Line (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 via-indigo-500/50 to-indigo-500/20 -translate-y-1/2 z-0" />

        {/* STEP 1: CLIENT */}
        <div className="relative z-10 bg-slate-900 border border-slate-700 p-6 rounded-xl flex flex-col items-center text-center hover:border-indigo-500 transition-colors h-full">
          <div className="w-16 h-16 bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
            <Globe className="h-8 w-8 text-indigo-400" />
          </div>
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">Frontend</div>
          <h3 className="text-lg font-bold text-white mb-2">Web App (React)</h3>
          <p className="text-sm text-slate-400 mb-4">
            Interfaccia dove l'utente si registra, paga l'abbonamento e crea le email.
          </p>
          <ul className="text-xs text-left w-full space-y-2 bg-slate-950 p-3 rounded border border-slate-800 mt-auto">
            <li className="flex items-center gap-2"><User className="h-3 w-3 text-green-400"/> Login / Register</li>
            <li className="flex items-center gap-2"><CreditCard className="h-3 w-3 text-blue-400"/> Pagamento Stripe</li>
            <li className="flex items-center gap-2"><Mail className="h-3 w-3 text-purple-400"/> Editor Campagne</li>
          </ul>
        </div>

        {/* STEP 2: AUTH & DB */}
        <div className="relative z-10 bg-slate-900 border border-slate-700 p-6 rounded-xl flex flex-col items-center text-center hover:border-green-500 transition-colors h-full">
          <div className="w-16 h-16 bg-green-900/50 rounded-2xl flex items-center justify-center mb-4 border border-green-500/30">
            <Database className="h-8 w-8 text-green-400" />
          </div>
          <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">Supabase</div>
          <h3 className="text-lg font-bold text-white mb-2">Auth & Stato</h3>
          <p className="text-sm text-slate-400 mb-4">
            La "memoria" del sistema. Non invia mail, ma sa chi ha il diritto di farlo.
          </p>
          <ul className="text-xs text-left w-full space-y-2 bg-slate-950 p-3 rounded border border-slate-800 mt-auto">
            <li className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-green-400"/> JWT Tokens</li>
            <li className="flex items-center gap-2"><Database className="h-3 w-3 text-green-400"/> Tabella 'Credits'</li>
            <li className="flex items-center gap-2"><Database className="h-3 w-3 text-green-400"/> Log Campagne</li>
          </ul>
        </div>

        {/* STEP 3: PROXY */}
        <div className="relative z-10 bg-slate-900 border border-slate-700 p-6 rounded-xl flex flex-col items-center text-center hover:border-amber-500 transition-colors h-full">
          <div className="w-16 h-16 bg-amber-900/50 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30">
            <Server className="h-8 w-8 text-amber-400" />
          </div>
          <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">VPS Node.js</div>
          <h3 className="text-lg font-bold text-white mb-2">API Proxy</h3>
          <p className="text-sm text-slate-400 mb-4">
            Il codice intermedio che ho scritto nella demo. Protegge Mailcow dal pubblico.
          </p>
          <ul className="text-xs text-left w-full space-y-2 bg-slate-950 p-3 rounded border border-slate-800 mt-auto">
            <li className="flex items-center gap-2"><Lock className="h-3 w-3 text-amber-400"/> Valida JWT Supabase</li>
            <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-amber-400"/> Controlla saldo</li>
            <li className="flex items-center gap-2"><Server className="h-3 w-3 text-amber-400"/> Chiama Mailcow API</li>
          </ul>
        </div>

        {/* STEP 4: MAILCOW */}
        <div className="relative z-10 bg-slate-900 border border-slate-700 p-6 rounded-xl flex flex-col items-center text-center hover:border-blue-500 transition-colors h-full">
          <div className="w-16 h-16 bg-blue-900/50 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
            <Mail className="h-8 w-8 text-blue-400" />
          </div>
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">Infrastructure</div>
          <h3 className="text-lg font-bold text-white mb-2">Mailcow</h3>
          <p className="text-sm text-slate-400 mb-4">
            Il motore SMTP installato sul tuo VPS. Fa il lavoro sporco.
          </p>
          <ul className="text-xs text-left w-full space-y-2 bg-slate-950 p-3 rounded border border-slate-800 mt-auto">
            <li className="flex items-center gap-2"><Mail className="h-3 w-3 text-blue-400"/> Invio SMTP Reale</li>
            <li className="flex items-center gap-2"><Globe className="h-3 w-3 text-blue-400"/> Gestione DNS/DKIM</li>
            <li className="flex items-center gap-2"><Database className="h-3 w-3 text-blue-400"/> Storage Email</li>
          </ul>
        </div>
      </div>

      {/* Code Explanation */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">Come gestisco il flusso "Acquisto Casella"?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded text-indigo-400 font-mono text-sm">1</div>
                    <p className="text-slate-300 text-sm">L'utente clicca "Compra Casella" nell'app React.</p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded text-indigo-400 font-mono text-sm">2</div>
                    <p className="text-slate-300 text-sm">React chiama Stripe. Se paga, React chiama <code>supabase.from('users').update({'{credits: 1}'})</code>.</p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="bg-indigo-500/20 p-2 rounded text-indigo-400 font-mono text-sm">3</div>
                    <p className="text-slate-300 text-sm">L'utente configura la casella. React invia i dati al tuo <strong>VPS Node.js</strong> con il token utente.</p>
                </div>
            </div>
            <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <div className="bg-amber-500/20 p-2 rounded text-amber-400 font-mono text-sm">4</div>
                    <p className="text-slate-300 text-sm">Il VPS verifica su Supabase: "Questo token è valido? Ha crediti?".</p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="bg-blue-500/20 p-2 rounded text-blue-400 font-mono text-sm">5</div>
                    <p className="text-slate-300 text-sm">Se SÌ: Il VPS chiama l'API interna di Mailcow e crea la casella.</p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="bg-green-500/20 p-2 rounded text-green-400 font-mono text-sm">6</div>
                    <p className="text-slate-300 text-sm">Il VPS risponde "OK" a React. L'utente vede la sua nuova email.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};