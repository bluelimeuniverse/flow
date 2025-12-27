
import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, MoreHorizontal, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase, Contact } from '../lib/supabase';

export const CRM: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      if (data) {
        setContacts(data as Contact[]);
      }
    } catch (err: any) {
      console.error('Errore fetch contatti:', err);
      setError(err.message || "Impossibile caricare i contatti. Verifica le chiavi Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.last_name && c.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <div>
              <h2 className="text-2xl font-bold text-white">CRM & Contacts</h2>
              <p className="text-slate-400">Gestione leads dal database Supabase.</p>
          </div>
          <div className="flex gap-3">
              <button className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-700">
                  <Download className="h-4 w-4" /> Export
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-900/20">
                  + Add Contact
              </button>
          </div>
       </div>

       <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex gap-4">
              <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Cerca per email, nome o azienda..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:border-blue-500 outline-none"
                  />
              </div>
              <button onClick={fetchContacts} className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:text-white">
                  <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
          </div>

          {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-400">Caricamento contatti da Supabase...</p>
              </div>
          ) : error ? (
              <div className="p-8 text-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                  <p className="text-red-400 mb-2">{error}</p>
              </div>
          ) : contacts.length === 0 ? (
               <div className="p-8 text-center">
                  <p className="text-slate-400">Nessun contatto trovato nella tabella 'contacts'.</p>
              </div>
          ) : (
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                      <tr>
                          <th className="px-6 py-4">Contact</th>
                          <th className="px-6 py-4">Tags</th>
                          <th className="px-6 py-4">Company</th>
                          <th className="px-6 py-4">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                      {filteredContacts.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-700/30 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                                          {(lead.first_name?.[0] || lead.email[0])}
                                      </div>
                                      <div>
                                          <div className="text-sm font-medium text-white">
                                            {lead.first_name} {lead.last_name}
                                          </div>
                                          <div className="text-xs text-slate-500">{lead.email}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex gap-1 flex-wrap">
                                      {lead.tags && lead.tags.length > 0 ? lead.tags.map((tag, i) => (
                                          <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-[10px] text-slate-300">{tag}</span>
                                      )) : <span className="text-slate-600 text-xs">-</span>}
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-300">{lead.company || '-'}</td>
                              <td className="px-6 py-4">
                                  {lead.subscribed ? (
                                      <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Subscribed</span>
                                  ) : (
                                      <span className="text-slate-500 text-xs">Unsubscribed</span>
                                  )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          )}
       </div>
    </div>
  );
};
