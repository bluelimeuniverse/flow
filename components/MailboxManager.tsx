import React, { useState, useEffect } from 'react';
import { Server, Plus, RefreshCw, Mail, Loader2, AlertTriangle, Copy, Check, Clock, Trash2, Eye, EyeOff, Wand2, Globe, CheckCircle2, ExternalLink, ShoppingCart, ArrowRight, Lock, XCircle } from 'lucide-react';
import { supabase, Mailbox } from '../lib/supabase';

// LINK AFFILIATO (Sostituire con il tuo link affiliato reale, es: Impact Radius o CJ)
// Qui usiamo un deep link diretto alla ricerca domini
const AFFILIATE_LINK_BASE = "https://www.namecheap.com/domains/registration/results/?domain=";

interface MailboxManagerProps {
  onOpenWebmail?: (mailboxId: string) => void;
}

export const MailboxManager: React.FC<MailboxManagerProps> = ({ onOpenWebmail }) => {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newMailbox, setNewMailbox] = useState({ email: '', password: '', name: '' });
  const [creationStep, setCreationStep] = useState<'form' | 'success'>('form');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Logic: Extract domain dynamically
  const domain = newMailbox.email.includes('@') ? newMailbox.email.split('@')[1] : '';
  const isDomainValid = domain.includes('.') && domain.length > 3;

  useEffect(() => {
    fetchMailboxes();
  }, []);

  const fetchMailboxes = async () => {
    setRefreshing(true);
    const { data } = await supabase.from('mailboxes').select('*').order('created_at', { ascending: false });
    if (data) setMailboxes(data as Mailbox[]);
    setRefreshing(false);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewMailbox({ ...newMailbox, password: pass });
  };

  const handleCreate = async () => {
    if (!newMailbox.email || !newMailbox.password) return;
    setLoading(true);

    try {
      // Call backend API
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/mailboxes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: newMailbox.email,
          password: newMailbox.password,
          name: newMailbox.name || newMailbox.email.split('@')[0],
          userId: session?.user?.id
        })
      });

      if (response.status === 401) {
        alert('Sessione scaduta. Ricarica la pagina.');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setCreationStep('success');
        fetchMailboxes();
      } else {
        alert('Errore: ' + (result.error || 'Impossibile creare la casella'));
      }
    } catch (e) {
      alert('Errore di connessione al server');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setCreationStep('form');
    setNewMailbox({ email: '', password: '', name: '' });
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Copia">
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="h-6 w-6 text-blue-500" />
            Gestione Infrastruttura Email
          </h2>
          <p className="text-slate-400 mt-1">Gestisci domini, caselle postali e configurazioni DNS.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchMailboxes}
            disabled={refreshing}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all"
          >
            <Plus className="h-5 w-5" /> Nuova Casella
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isCreating ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden max-w-3xl mx-auto shadow-2xl">
          {/* Creation Wizard Header */}
          <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {creationStep === 'form' ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">1</div>
                  Configura Casella
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm"><Check className="h-5 w-5" /></div>
                  Casella Creata con Successo!
                </>
              )}
            </h3>
            {creationStep === 'form' && (
              <button onClick={resetForm} className="text-slate-400 hover:text-white"><XCircle className="h-6 w-6" /></button>
            )}
          </div>

          <div className="p-8">
            {creationStep === 'form' ? (
              <div className="space-y-6">
                {/* FORM INPUTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Indirizzo Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                      <input
                        type="email"
                        value={newMailbox.email}
                        onChange={(e) => setNewMailbox({ ...newMailbox, email: e.target.value })}
                        placeholder="info@iltuodominio.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nome Visualizzato</label>
                    <input
                      type="text"
                      value={newMailbox.name}
                      onChange={(e) => setNewMailbox({ ...newMailbox, name: e.target.value })}
                      placeholder="Es: Mario Rossi"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-slate-300">Password</label>
                      <button onClick={generatePassword} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <Wand2 className="h-3 w-3" /> Genera Sicura
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newMailbox.password}
                        onChange={(e) => setNewMailbox({ ...newMailbox, password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-12 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AFFILIATE BANNER (PRE-PURCHASE - LIVE CHECK) */}
                {isDomainValid && (
                  <div className="animate-fade-in bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 hidden sm:block">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-indigo-200">Non possiedi {domain}?</h4>
                        <p className="text-xs text-indigo-300/80 mt-1">
                          Per usare questa mail devi essere il proprietario del dominio.
                        </p>
                      </div>
                    </div>
                    <a
                      href={`${AFFILIATE_LINK_BASE}${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Registra {domain}
                    </a>
                  </div>
                )}

                <div className="pt-4 flex gap-3 justify-end">
                  <button
                    onClick={resetForm}
                    className="px-5 py-2.5 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading || !newMailbox.email || !newMailbox.password}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    Crea Casella Mail
                  </button>
                </div>
              </div>
            ) : (
              /* SUCCESS & CONFIGURATION VIEW */
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Casella Pronta!</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    La casella <strong>{newMailbox.email}</strong> è stata configurata lato server.
                    Affinché funzioni, devi configurare il dominio.
                  </p>
                </div>

                {/* CONFIGURATION STEPS */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
                  {/* STEP 1: ACQUISTO DOMINIO (AFFILIATE LINK) */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 font-bold">1</div>
                      <div className="w-0.5 h-full bg-slate-800"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <h4 className="text-lg font-bold text-white mb-2">Verifica Proprietà Dominio</h4>
                      <p className="text-sm text-slate-400 mb-3">
                        Se non hai ancora acquistato <strong>{domain}</strong>, fallo ora per ottenere il controllo dei DNS.
                      </p>
                      <a
                        href={`${AFFILIATE_LINK_BASE}${domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-900/20 transition-all transform hover:scale-105"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Acquista {domain}
                        <ExternalLink className="h-3 w-3 opacity-70" />
                      </a>
                    </div>
                  </div>

                  {/* STEP 2: DNS */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-300 font-bold">2</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-2">Configura i Record DNS</h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Accedi al pannello di controllo del tuo dominio e aggiungi questi record:
                      </p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="text-slate-500 border-b border-slate-800">
                              <th className="py-2 font-medium">Type</th>
                              <th className="py-2 font-medium">Host / Name</th>
                              <th className="py-2 font-medium">Value / Target</th>
                              <th className="py-2 font-medium">Priority</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300 font-mono">
                            <tr className="border-b border-slate-800/50">
                              <td className="py-3 text-blue-400">MX</td>
                              <td className="py-3">@</td>
                              <td className="py-3 flex items-center gap-2 group">
                                mail.bluelimeflow.com
                                <CopyButton text="mail.bluelimeflow.com" />
                              </td>
                              <td className="py-3">10</td>
                            </tr>
                            <tr className="border-b border-slate-800/50">
                              <td className="py-3 text-emerald-400">TXT</td>
                              <td className="py-3">@</td>
                              <td className="py-3 flex items-center gap-2 group">
                                v=spf1 mx a include:bluelimeflow.com ~all
                                <CopyButton text="v=spf1 mx a include:bluelimeflow.com ~all" />
                              </td>
                              <td className="py-3">-</td>
                            </tr>
                            <tr>
                              <td className="py-3 text-purple-400">CNAME</td>
                              <td className="py-3">mail</td>
                              <td className="py-3 flex items-center gap-2 group">
                                bluelimeflow.com
                                <CopyButton text="bluelimeflow.com" />
                              </td>
                              <td className="py-3">-</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-200/80">
                          I cambiamenti DNS possono richiedere fino a 24 ore per propagarsi in tutto il mondo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={resetForm}
                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                  >
                    Ho capito, Torna alla Lista
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* DASHBOARD OVERVIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="col-span-1 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-400" /> Stato DNS Globali
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-700/50">
                <div className="text-sm text-slate-400">Server IP</div>
                <div className="text-sm text-white font-mono">162.55.x.x</div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-700/50">
                <div className="text-sm text-slate-400">MX Record</div>
                <div className="text-sm text-green-400 font-mono flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Configured</div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.open(mailboxes[0]?.url_sogo || 'https://mail.bluelimeflow.com/SOGo/', '_blank')}
                  className="w-full block text-center py-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-all text-sm font-bold mb-2"
                >
                  Accedi a SOGo (Esterno)
                </button>
                <div className="text-center text-xs text-slate-500">
                  <span className="opacity-50">Webmail Interna (Beta):</span>
                  <button
                    onClick={() => onOpenWebmail && mailboxes.length > 0 && onOpenWebmail(mailboxes[0].id)}
                    className="text-indigo-400 hover:text-indigo-300 ml-1 underline"
                  >
                    Prova qui
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mailboxes List */}
          <div className="col-span-1 md:col-span-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-white">Caselle Attive ({mailboxes.length})</h3>
              <span className="text-xs text-slate-500">Aggiornato: {new Date().toLocaleTimeString()}</span>
            </div>

            <div className="divide-y divide-slate-700/50">
              {mailboxes.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Nessuna casella trovata. Creane una nuova!</p>
                </div>
              ) : (
                mailboxes.map((box) => (
                  <div key={box.id} className="p-4 hover:bg-slate-700/30 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{box.email}</h4>
                        <p className="text-xs text-slate-400">{box.name || 'Utente'} • Quota: {box.quota || '3GB'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex flex-col items-end text-xs text-slate-500">
                        <span>SMTP: {box.smtp_host}</span>
                        <span>Port: {box.smtp_port || 587}</span>
                      </div>

                      {/* Tasto Webmail Rapido */}
                      <button
                        onClick={() => onOpenWebmail && onOpenWebmail(box.id)}
                        className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded text-xs font-bold transition-all border border-indigo-500/30"
                      >
                        Webmail
                      </button>

                      <div className="h-8 w-px bg-slate-700 hidden md:block"></div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-600 rounded text-slate-300" title="Impostazioni"><Server className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-red-900/30 hover:text-red-400 rounded text-slate-300" title="Elimina"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};