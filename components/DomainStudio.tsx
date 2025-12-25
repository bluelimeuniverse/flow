
import React, { useState } from 'react';
import { Globe, Search, ShoppingCart, ArrowRight, CheckCircle2, Server, Plus, Loader2, Copy, Terminal } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Prefissi e Suffissi per la "Beast Mode"
const PREFIXES = ['get', 'try', 'use', 'my', 'the', 'go', 'hello', 'join'];
const SUFFIXES = ['app', 'team', 'hq', 'labs', 'box', 'flow', 'mail', 'io', 'net', 'group'];

export const DomainStudio: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'generator' | 'import'>('generator');

    // Generator State
    const [keyword, setKeyword] = useState('');
    const [generatedDomains, setGeneratedDomains] = useState<string[]>([]);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

    // Import State
    const [importList, setImportList] = useState('');
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    // 1. GENERATORE DI DOMINI
    const generateDomains = () => {
        if (!keyword) return;
        const cleanKw = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
        const list: string[] = [];

        // TLDs standard
        list.push(`${cleanKw}.com`);
        list.push(`${cleanKw}.co`);

        // Prefissi
        PREFIXES.forEach(pre => list.push(`${pre}${cleanKw}.com`));

        // Suffissi
        SUFFIXES.forEach(suf => list.push(`${cleanKw}${suf}.com`));

        setGeneratedDomains(list);
    };

    const toggleSelection = (domain: string) => {
        if (selectedDomains.includes(domain)) {
            setSelectedDomains(selectedDomains.filter(d => d !== domain));
        } else {
            setSelectedDomains([...selectedDomains, domain]);
        }
    };

    const handleBulkBuy = () => {
        // Esempio URL Namecheap Bulk (da verificare con il programma di affiliazione esatto)
        const domainsString = selectedDomains.join(',');
        // Usa un link deep search se disponibile o copia negli appunti
        navigator.clipboard.writeText(domainsString);
        window.open(`https://www.namecheap.com/domains/registration/results/?domain=${selectedDomains[0]}`, '_blank');
        // Nota: Namecheap non ha un URL bulk pubblico facile, ma spaceships si. 
        // Per ora apriamo la ricerca del primo e copiamo la lista.
        alert(`Ho copiato ${selectedDomains.length} domini negli appunti! Incollali nella ricerca bulk del provider.`);
    };

    // 2. IMPORTAZIONE E CONFIGURAZIONE (Backend)
    const handleImport = async () => {
        setProcessing(true);
        setResults([]);

        const domainsToProcess = importList.split('\n').map(d => d.trim()).filter(d => d.includes('.'));

        const newResults = [];

        for (const domain of domainsToProcess) {
            try {
                // 1. Registra Dominio su Mailcow
                // 2. Crea casella postmaster o info di default? Per ora registriamo solo il dominio.
                const { data: { session } } = await supabase.auth.getSession();

                const res = await fetch('/api/domains/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ domain })
                });

                const data = await res.json();
                newResults.push({ domain, success: data.success, error: data.error, dns: data.dns });

            } catch (e) {
                newResults.push({ domain, success: false, error: 'Errore di connessione' });
            }
        }

        setResults(newResults);
        setProcessing(false);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in text-white p-6">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-700 pb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Globe className="h-8 w-8 text-blue-500" />
                        Domain Studio
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Il motore della tua infrastruttura. Cerca domini brandizzati, acquistali in blocco e configurali istantaneamente.
                    </p>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`px-4 py-2 rounded-md transition-all ${activeTab === 'generator' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Generator & Buy
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`px-4 py-2 rounded-md transition-all ${activeTab === 'import' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Bulk Import & Config
                    </button>
                </div>
            </div>

            {activeTab === 'generator' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* SEARCH PANEL */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 block">Brand Keyword</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={e => setKeyword(e.target.value)}
                                    placeholder="es. bluelime"
                                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    onKeyDown={e => e.key === 'Enter' && generateDomains()}
                                />
                                <button
                                    onClick={generateDomains}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg transition-colors"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                Genera automaticamente varianti con prefissi (get, try...) e suffissi (app, hq...) ottimizzati per il sending.
                            </p>
                        </div>

                        {/* SUMMARY CART */}
                        {selectedDomains.length > 0 && (
                            <div className="bg-indigo-900/40 p-6 rounded-xl border border-indigo-500/30 animate-fade-in">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                    <ShoppingCart className="h-5 w-5 text-indigo-400" />
                                    Carrello ({selectedDomains.length})
                                </h3>
                                <div className="max-h-40 overflow-y-auto space-y-1 mb-4 text-sm text-indigo-200 scrollbar-thin">
                                    {selectedDomains.map(d => (
                                        <div key={d} className="flex justify-between">
                                            <span>{d}</span>
                                            <span className="text-indigo-400">~8.88$</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-indigo-500/30 pt-4 flex justify-between items-center mb-4">
                                    <span className="font-bold">Totale Stimato:</span>
                                    <span className="text-xl font-bold text-white">~${(selectedDomains.length * 8.88).toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleBulkBuy}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                                >
                                    Acquista su Namecheap/Spaceship <ArrowRight className="h-4 w-4" />
                                </button>
                                <p className="text-center text-xs text-indigo-400 mt-2">Si aprirà in una nuova scheda.</p>
                            </div>
                        )}
                    </div>

                    {/* RESULTS GRID */}
                    <div className="lg:col-span-2">
                        {generatedDomains.length > 0 ? (
                            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                                <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-300">Varianti Generate ({generatedDomains.length})</h3>
                                    <button onClick={() => setSelectedDomains([...generatedDomains])} className="text-xs text-blue-400 hover:text-white">Seleziona Tutti</button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-700">
                                    {generatedDomains.map(domain => (
                                        <div
                                            key={domain}
                                            onClick={() => toggleSelection(domain)}
                                            className={`bg-slate-800 p-4 cursor-pointer hover:bg-slate-750 transition-colors flex justify-between items-center ${selectedDomains.includes(domain) ? 'bg-blue-900/20 shadow-inner' : ''}`}
                                        >
                                            <span className={`${selectedDomains.includes(domain) ? 'text-blue-200 font-semibold' : 'text-slate-300'}`}>{domain}</span>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedDomains.includes(domain) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-600'}`}>
                                                {selectedDomains.includes(domain) && <CheckCircle2 className="h-3 w-3" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-12 text-slate-500">
                                <div className="text-center">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Inserisci una keyword per generare domini.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'import' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* INPUT AREA */}
                    <div className="space-y-4">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-green-400" />
                                Importazione Domini
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Incolla qui la lista dei domini che hai acquistato (uno per riga).
                                Il sistema li configurerà automaticamente su Mailcow.
                            </p>
                            <textarea
                                value={importList}
                                onChange={e => setImportList(e.target.value)}
                                placeholder="getbrand.com&#10;brandapp.com&#10;..."
                                className="w-full h-64 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                            />
                            <button
                                onClick={handleImport}
                                disabled={processing || !importList}
                                className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2"
                            >
                                {processing ? <Loader2 className="animate-spin h-5 w-5" /> : <Server className="h-5 w-5" />}
                                Configura Domini su Mailcow
                            </button>
                        </div>
                    </div>

                    {/* RESULTS LOG */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 overflow-hidden flex flex-col h-[500px]">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Log Configurazione</h3>
                        <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs scrollbar-thin pr-2">
                            {results.length === 0 && !processing && (
                                <p className="text-slate-600 italic">In attesa di importazione...</p>
                            )}
                            {results.map((res, i) => (
                                <div key={i} className={`p-3 rounded border ${res.success ? 'bg-green-900/10 border-green-900/50' : 'bg-red-900/10 border-red-900/50'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold ${res.success ? 'text-green-400' : 'text-red-400'}`}>{res.domain}</span>
                                        {res.success ? <span className="text-green-500">OK</span> : <span className="text-red-500">FALLITO</span>}
                                    </div>
                                    {res.success ? (
                                        <div className="space-y-1 mt-2">
                                            <div className="flex gap-2 text-slate-400">
                                                <span className="w-8">DKIM:</span>
                                                <span className="text-slate-300 truncate cursor-pointer hover:text-white" title={res.dns?.dkim}>{res.dns?.dkim || 'N/D'}</span>
                                            </div>
                                            <div className="flex gap-2 text-slate-400">
                                                <span className="w-8">SPF:</span>
                                                <span className="text-slate-300">v=spf1 mx include:{res.domain} ~all</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-red-400">{res.error}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
