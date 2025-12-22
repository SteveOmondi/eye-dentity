import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi, type CheckoutSession } from '../api/payment';
import { WaitingGame } from '../components/WaitingGame';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    fetchSession(sessionId);
  }, [searchParams]);

  const fetchSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await paymentApi.getCheckoutSession(sessionId);
      setSession(response);
    } catch (err: any) {
      console.error('Failed to fetch session:', err);
      setError(err.response?.data?.error || 'Failed to retrieve payment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-wizard-accent"></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Validating Transaction Hash...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] p-4">
        <div className="max-w-md w-full glass-card border-red-500/20 rounded-[2.5rem] p-10 bg-red-500/5">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] mb-6">
              <svg
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">VALIDATION ERROR</h2>
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest opacity-80">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-10 w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Return to Grid
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] bg-mesh-gradient p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(196,240,66,0.05)_0%,transparent_50%)]" />

      <div className="max-w-2xl w-full glass-card border-white/5 rounded-[3rem] p-10 md:p-16 relative z-10 animate-fade-up">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-[2rem] bg-wizard-accent/10 border border-wizard-accent/30 shadow-[0_0_40px_rgba(196,240,66,0.15)] relative group">
            <div className="absolute inset-0 rounded-[2rem] bg-wizard-accent/20 animate-ping opacity-20" />
            <svg
              className="h-12 w-12 text-wizard-accent transform group-hover:scale-110 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="mt-10 text-4xl font-black text-white tracking-tighter uppercase">
            Order Confirmed
          </h2>
          <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
            Identity synchronization complete
          </p>
        </div>

        {/* Order Details */}
        {session && (
          <div className="mt-12 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Payload Details</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Domain ID</p>
                <p className="text-xs font-black text-white uppercase tracking-tight truncate">{session.order.domain}</p>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Architecture</p>
                <p className="text-xs font-black text-wizard-purple uppercase tracking-tight">{session.order.hostingPlan} STRATUM</p>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl md:col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Contribution</p>
                  <p className="text-3xl font-black text-wizard-accent tracking-tighter">${session.order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="px-4 py-2 bg-wizard-accent/10 rounded-xl border border-wizard-accent/30">
                  <span className="text-[10px] font-black text-wizard-accent uppercase tracking-widest">SETTLED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="mt-12 p-8 bg-wizard-purple/5 border border-wizard-purple/20 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 text-wizard-purple group-hover:scale-125 transition-transform duration-700">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">
            DEPLOYMENT PIPELINE
          </h3>
          <ul className="space-y-4">
            {[
              'AI Engine generating core structure',
              'DNS propagation initiating worldwide',
              'SSL certificates being signed and issued',
              'Control panel access being provisioned'
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-4 group/item">
                <div className="w-5 h-5 bg-wizard-purple/20 rounded-lg flex items-center justify-center text-wizard-purple border border-wizard-purple/30 group-hover/item:bg-wizard-purple group-hover/item:text-white transition-all">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/item:text-white transition-colors">{step}</span>
              </li>
            ))}
          </ul>

          <WaitingGame />
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col md:flex-row gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-5 px-6 bg-wizard-accent text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_30px_rgba(196,240,66,0.2)] hover:shadow-[0_15px_40px_rgba(196,240,66,0.3)] hover:-translate-y-1 transition-all active:scale-95"
          >
            Enter Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-5 px-6 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all"
          >
            System Core
          </button>
        </div>
      </div>
    </div>
  );
};
