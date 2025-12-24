import React, { useState } from 'react';
import { Mails, Plus, Send, Server, ShieldAlert, Copy, Check, Users, BarChart, Zap } from 'lucide-react';

type Tab = 'create' | 'send' | 'marketing' | 'server';

export const MailcowDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [copied, setCopied] = useState(false);

  // Simulation States
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // Form Data
  const [mailboxUser, setMailboxUser] = useState('');
  const [mailboxDomain, setMailboxDomain] = useState('example.com');
  const [sendTo, setSendTo] = useState('');
  const [subject, setSubject] = useState('');
  
  // Marketing Data
  const [campaignName, setCampaignName] = useState('');
  const [recipientCount, setRecipientCount] = useState(1000);

  const handleSimulate = (action: string) => {
    setIsLoading(true);
    setFeedback(null);
    
    setTimeout(() => {
      setIsLoading(false);
      let msg = '';
      if (action === 'create') msg = `Successo: Casella ${mailboxUser}@${mailboxDomain} creata su Mailcow!`;
      if (action === 'send') msg = `Successo: Email inviata a ${sendTo} tramite SMTP!`;
      if (action === 'marketing') msg = `Campagna "${campaignName}" avviata verso ${recipientCount} contatti!`;
      
      setFeedback({
        type: 'success',
        msg
      });
    }, 1500);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(serverCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const serverCode = `
// ==========================================
// AGGIUNTA AL FILE SERVER.JS: MARKETING ENDPOINT
// ==========================================

// 3. MARKETING MASSIVO (Richiede gestione code es. BullMQ in produzione)
app.post('/api/campaign/start', async (req, res) => {
  const { campaignName, templateId, recipientListId, userToken } = req.body;

  // 1. VERIFICA SUPABASE (Pseudo-codice)
  // const user = await supabase.auth.getUser(userToken);
  // const credits = await supabase.from('users').select('credits').eq('id', user.id);
  // if (credits < recipientCount) return res.status(403).send("Crediti insufficienti");

  try {
    // Simulazione loop invio
    // In produzione: aggiungi job a una coda Redis per non bloccare il server
    console.log(\`Avvio campagna \${campaignName}\`);
    
    // Esempio invio singolo all'interno del loop
    // await transporter.sendMail({ ... });

    res.json({ success: true, status: 'queued', count: 5000 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
`.trim();

  return (
    <div className="w-full max-w-5xl animate-fade-in space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Mailcow & Marketing Manager</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Dimostrazione delle funzionalità che posso implementare per i tuoi utenti finali.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { id: 'create', label: 'Crea Casella', icon: Plus },
          { id: 'send', label: 'Test Singolo', icon: Send },
          { id: 'marketing', label: 'Campagna Marketing', icon: Users },
          { id: 'server', label: 'Codice Backend', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden min-h-[400px]">
        {/* Content based on Tab */}
        
        {activeTab === 'create' && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center text-white">Nuova Casella Mailcow</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm text-slate-400 mb-1">Username</label>
                <input 
                  type="text" 
                  value={mailboxUser}
                  onChange={(e) => setMailboxUser(e.target.value)}
                  placeholder="mario" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm text-slate-400 mb-1">Dominio</label>
                <select 
                  value={mailboxDomain}
                  onChange={(e) => setMailboxDomain(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option>tuodominio.it</option>
                  <option>azienda.com</option>
                  <option>test.net</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Password Iniziale</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
            </div>

            <button 
              onClick={() => handleSimulate('create')}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
            >
              {isLoading ? 'Connessione API in corso...' : 'Crea Casella'}
            </button>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Send className="h-6 w-6 text-blue-400 ml-1" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center text-white">Invia tramite SMTP</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">A (Destinatario)</label>
                <input 
                  type="email" 
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="cliente@gmail.com" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Oggetto</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Benvenuto nel servizio" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Messaggio</label>
                <textarea rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
              </div>
            </div>

            <button 
               onClick={() => handleSimulate('send')}
               disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
            >
               {isLoading ? 'Invio SMTP in corso...' : 'Invia Email'}
            </button>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
             <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center text-white">Campagna Massiva</h3>
            <p className="text-center text-slate-400 text-sm">
              Simula l'invio a migliaia di contatti (richiede code su backend).
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome Campagna</label>
                <input 
                  type="text" 
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Newsletter Estate 2024" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Lista Destinatari</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none">
                    <option>Tutti gli utenti (Active)</option>
                    <option>Newsletter Subscribers</option>
                    <option>Clienti Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Stima Destinatari</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={recipientCount}
                      onChange={(e) => setRecipientCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <Users className="absolute right-3 top-3.5 h-4 w-4 text-slate-500"/>
                  </div>
                </div>
              </div>
              
               <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                 <div className="flex justify-between text-sm mb-2">
                   <span className="text-slate-400">Velocità Invio Stimata</span>
                   <span className="text-white">50 mail/minuto</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2">
                   <div className="bg-purple-500 h-2 rounded-full w-3/4"></div>
                 </div>
               </div>
            </div>

            <button 
               onClick={() => handleSimulate('marketing')}
               disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
            >
               {isLoading ? 'Scheduling code...' : 'Avvia Campagna'}
            </button>
          </div>
        )}

        {activeTab === 'server' && (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="flex items-start gap-4 mb-6 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-400">Logica Backend Aggiuntiva</h4>
                <p className="text-sm text-slate-300 mt-1">
                  Per gestire campagne massive, il backend deve essere asincrono. Qui vedi come strutturerei l'endpoint per gestire grandi volumi senza bloccare il server.
                </p>
              </div>
            </div>

            <div className="relative bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex-grow">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">server_marketing.js</span>
                <button 
                  onClick={copyCode}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copiato!' : 'Copia Codice'}
                </button>
              </div>
              <pre className="p-4 overflow-auto text-sm font-mono text-slate-300 h-[300px]">
                {serverCode}
              </pre>
            </div>
          </div>
        )}

        {/* Simulated Feedback Toast */}
        {feedback && (
          <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl border flex items-center gap-2 animate-fade-in-up ${
            feedback.type === 'success' 
              ? 'bg-green-900/90 border-green-500 text-green-100' 
              : 'bg-red-900/90 border-red-500 text-red-100'
          }`}>
            <Check className="h-4 w-4" />
            {feedback.msg}
          </div>
        )}
      </div>
    </div>
  );
};