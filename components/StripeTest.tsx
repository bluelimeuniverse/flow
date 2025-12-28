import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

// Make sure to use the Test Public Key here if not in env, but better to use env
// const stripePromise = loadStripe('pk_test_...'); 
// We will fetch it from env via a prop or just assume the one in DomainStudio is correct.
// Actually, let's grab it generically.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function StripeTest() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTestPayment = async () => {
        setLoading(true);
        setError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();

            // Call the special test endpoint
            const res = await fetch('/api/test-stripe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Network error');
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-8">Stripe Integration Test</h1>

            <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                <p className="mb-6 text-gray-300">
                    Prova di pagamento isolata:
                    <br />
                    <span className="text-2xl font-bold text-white mt-2 block">€1.00</span>
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleTestPayment}
                    disabled={loading}
                    className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? 'Processing...' : 'Paga 1 Euro (TEST)'}
                </button>
            </div>
        </div>
    );
}
