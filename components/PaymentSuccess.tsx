import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentSuccessProps {
    sessionId: string;
    onBack: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ sessionId, onBack }) => {
    const [status, setStatus] = useState<'verifying' | 'configuring' | 'complete' | 'error'>('verifying');
    const [domains, setDomains] = useState<string[]>([]);
    const [configResults, setConfigResults] = useState<any[]>([]);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        verifyPayment();
    }, [sessionId]);

    const verifyPayment = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`/api/verify-checkout?session_id=${sessionId}`, {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            });
            const data = await res.json();

            if (data.success) {
                setDomains(data.domains);
                setStatus('configuring');
                configureDomains(data.domains);
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Payment Verification Failed');
            }
        } catch (e: any) {
            setStatus('error');
            setErrorMsg(e.message);
        }
    };

    const configureDomains = async (domainList: string[]) => {
        const results = [];
        const { data: { session } } = await supabase.auth.getSession();

        for (const domain of domainList) {
            try {
                // Call Mailcow Config
                const res = await fetch('/api/domains/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ domain })
                });
                const data = await res.json();
                results.push({ domain, success: data.success, error: data.error, dns: data.dns });
            } catch (e) {
                results.push({ domain, success: false, error: 'Connection Error' });
            }
            // Update results progressively
            setConfigResults([...results]);
        }
        setStatus('complete');
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-2xl">
                {status === 'verifying' && (
                    <div className="text-center py-12">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">Verifying Payment...</h2>
                    </div>
                )}

                {status === 'configuring' && (
                    <div className="text-center py-12">
                        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h2>
                        <p className="text-slate-400">Configuring Mailcow for {domains.length} domains...</p>

                        <div className="mt-8 text-left max-h-60 overflow-auto bg-slate-900 p-4 rounded-lg">
                            {configResults.map((r, i) => (
                                <div key={i} className="flex items-center gap-2 mb-2 text-sm">
                                    {r.success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                    <span className={r.success ? "text-green-300" : "text-red-300"}>{r.domain}</span>
                                    {r.error && <span className="text-slate-500">- {r.error}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {status === 'complete' && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">All Set!</h2>
                        <p className="text-slate-400 mb-8">
                            Your domains have been provisioned on Mailcow.
                            <br />
                            You can now create mailboxes for them.
                        </p>

                        <div className="text-left mb-8 bg-slate-900 border border-slate-700 p-6 rounded-lg">
                            <h3 className="font-semibold text-white mb-4">Provisioning Report</h3>
                            {configResults.map((r, i) => (
                                <div key={i} className="mb-4 border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        {r.success ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                                        <span className="font-bold text-lg text-white">{r.domain}</span>
                                    </div>
                                    {r.success && r.dns && (
                                        <div className="ml-7 text-xs font-mono text-slate-400 p-3 bg-slate-950 rounded">
                                            <div className="mb-1"><span className="text-blue-400">MX:</span> {r.dns.mx}</div>
                                            <div className="mb-1"><span className="text-blue-400">SPF:</span> {r.dns.spf}</div>
                                            <div><span className="text-blue-400">DKIM:</span> {r.dns.dkim}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button onClick={onBack} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 mx-auto">
                            <ArrowLeft className="w-5 h-5" />
                            Return to Dashboard
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
                        <p className="text-red-400 mb-6">{errorMsg}</p>
                        <button onClick={onBack} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">
                            Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
