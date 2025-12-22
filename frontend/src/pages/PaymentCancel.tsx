import { useNavigate } from 'react-router-dom';

export const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] bg-mesh-gradient p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(157,80,187,0.05)_0%,transparent_50%)]" />

      <div className="max-w-md w-full glass-card border-white/5 rounded-[3rem] p-10 md:p-12 relative z-10 animate-fade-up">
        {/* Warning Icon */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-[1.5rem] bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] mb-8">
            <svg
              className="h-10 w-10 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">
            Payment Aborted
          </h2>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            Transaction sequence interrupted. No assets have been transferred.
          </p>
        </div>

        {/* Information */}
        <div className="mt-10 space-y-4">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
              Status Report
            </h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-tight leading-relaxed">
              The checkout stream was terminated. Your progress is cached, but the deployment sequence is on standby.
            </p>
          </div>

          <div className="p-6 bg-wizard-purple/5 border border-wizard-purple/20 rounded-2xl">
            <h3 className="text-[10px] font-black text-wizard-purple uppercase tracking-[0.2em] mb-2">
              Resumption Possible
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tight leading-relaxed">
              Target domain and parameters are reserved. You can re-initiate the handshake sequence at your convenience.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 space-y-4">
          <button
            onClick={() => navigate('/builder')}
            className="w-full py-5 px-6 bg-wizard-accent text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_10px_30px_rgba(196,240,66,0.1)] hover:shadow-[0_15px_40px_rgba(196,240,66,0.2)] hover:-translate-y-1 transition-all"
          >
            Re-Sync & Complete
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-5 px-6 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all"
          >
            Terminal Home
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Identity support?{' '}
            <a
              href="mailto:support@eye-dentity.com"
              className="text-wizard-accent hover:text-white transition-colors ml-2"
            >
              Contact Core
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
