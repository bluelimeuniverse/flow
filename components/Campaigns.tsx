import React, { useState, useEffect } from 'react';
import { Send, Mail, Users, Calendar, Save, AlertCircle, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { supabase, Mailbox } from '../lib/supabase';

export const Campaigns: React.FC = () => {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // Campaign Data
  const [campaignData, setCampaignData] = useState({
    name: '',
    from_mailbox_id: '',
    subject: '',
    body: '',
    recipient_type: 'test' // 'test' or 'all'
  });

  const [testEmail, setTestEmail] = useState('');

  // Fetch Mailboxes on mount
  useEffect(() => {
    const fetchMailboxes = async () => {
      const { data } = await supabase.from('mailboxes').select('*').eq('active', true);
      if (data) setMailboxes(data as Mailbox[]);
    };
    fetchMailboxes();
  }, []);

  const handleSend = async () => {
    if (!campaignData.from_mailbox_id || !campaignData.subject || !campaignData.body) {
      setNotification({ type: 'error', msg: 'Compila tutti i campi obbligatori.' });
      return;
    }

    setLoading(true);
    try {
      let recipients: string[] = [];

      if (campaignData.recipient_type === 'test') {
          if(!testEmail) throw new Error("Inserisci l'email di test");
          recipients = [testEmail];
      } else {
          // In produzione qui faresti: await supabase.from('contacts').select('email')
          // Per ora simuliamo 3 contatti
          recipients = ['cliente1@example.com', 'cliente2@example.com', 'cliente3@example.com'];
      }

      // Creazione Payload per la coda
      const queueInserts = recipients.map(email => ({
        mailbox_id: campaignData.from_mailbox_id,
        to_email: email,
        subject: campaignData.subject,
        body_html: campaignData.body,
        status: 'pending'
      }));

      const { error } = await supabase.from('email_queue').insert(queueInserts);

      if (error) throw error;

      setNotification({ 
        type: 'success', 
        msg: `Campagna avviata! ${recipients.length} email messe in coda. Assicurati che il file worker.js sia in esecuzione.` 
      });
      
      // Reset
      setCampaignData(prev => ({...prev, subject: '', body: ''}));
    } catch (err: any) {
      setNotification({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaign Manager</h2>
          <p className="text-slate-400">Crea e invia email ai tuoi contatti.</p>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-900/30 border-green-500/50 text-green-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {notification.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
             <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-4">
                <div className="p-1.5 bg-blue-500/20 rounded text-blue-400"><Mail className="h-4 w-4"/></div>
                <h3 className="font-bold text-white">Contenuto Email</h3>
             </div>
             
             <div>
                <label className="block text-sm text-slate-400 mb-1">Nome Campagna (Interno)</label>
                <input 
                  type="text" 
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                  placeholder="Es: Newsletter Marzo"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>

             <div>
                <label className="block text-sm text-slate-400 mb-1">Oggetto</label>
                <input 
                  type="text" 
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({...campaignData, subject: e.target.value})}
                  placeholder="Oggetto accattivante..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
             </div>

             <div>
                <label className="block text-sm text-slate-400 mb-1">Messaggio (HTML)</label>
                <textarea 
                  rows={12}
                  value={campaignData.body}
                  onChange={(e) => setCampaignData({...campaignData, body: e.target.value})}
                  placeholder="<h1>Ciao!</h1><p>Scrivi qui il tuo contenuto...</p>"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                />
             </div>
          </div>
        </div>

        {/* Right: Configuration */}
        <div className="space-y-6">
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-4">
                <div className="p-1.5 bg-purple-500/20 rounded text-purple-400"><Users className="h-4 w-4"/></div>
                <h3 className="font-bold text-white">Impostazioni Invio</h3>
             </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Invia Da (Casella SMTP)</label>
                  <select 
                    value={campaignData.from_mailbox_id}
                    onChange={(e) => setCampaignData({...campaignData, from_mailbox_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Seleziona Casella...</option>
                    {mailboxes.map(box => (
                      <option key={box.id} value={box.id}>{box.email} (Host: {box.smtp_host})</option>
                    ))}
                  </select>
                  {mailboxes.length === 0 && <p className="text-xs text-red-400 mt-1">⚠ Nessuna casella attiva configurata.</p>}
                </div>

                <div>
                   <label className="block text-sm text-slate-400 mb-1">A chi inviare?</label>
                   <div className="grid grid-cols-2 gap-2 mb-2">
                      <button 
                        onClick={() => setCampaignData({...campaignData, recipient_type: 'test'})}
                        className={`px-3 py-2 rounded-lg text-sm border ${campaignData.recipient_type === 'test' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                        Test Singolo
                      </button>
                      <button 
                        onClick={() => setCampaignData({...campaignData, recipient_type: 'all'})}
                        className={`px-3 py-2 rounded-lg text-sm border ${campaignData.recipient_type === 'all' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                      >
                        Tutti i Contatti
                      </button>
                   </div>

                   {campaignData.recipient_type === 'test' && (
                      <input 
                        type="email" 
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="tua.email@gmail.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                   )}
                   
                   {campaignData.recipient_type === 'all' && (
                       <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg">
                          <div className="flex justify-between text-sm mb-1">
                             <span className="text-slate-400">Contatti Stimati:</span>
                             <span className="text-white font-bold">3 (Demo)</span>
                          </div>
                          <p className="text-xs text-slate-500">L'invio massivo verrà gestito dalla coda per evitare il blocco spam.</p>
                       </div>
                   )}
                </div>

                <div className="pt-4 border-t border-slate-700 space-y-3">
                    <button 
                    onClick={handleSend}
                    disabled={loading || !campaignData.from_mailbox_id}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                        {campaignData.recipient_type === 'test' ? 'Invia Test Ora' : 'Avvia Campagna'}
                    </button>
                    <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                        <Save className="h-4 w-4" /> Salva Bozza
                    </button>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};