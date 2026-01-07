import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { chatApi } from '../api/chat';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { useFormStore } from '../store/formStore';

export const Register = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);
    const { sessionId } = useFormStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            // Store in auth store
            setAuth(response.user, response.token);

            // Claim chat session if exists
            if (sessionId) {
                try {
                    await chatApi.claimChatSession(sessionId);
                } catch (chatErr) {
                    console.error('Failed to claim session:', chatErr);
                }
            }

            // Redirect back to builder or admin
            const fromBuilder = localStorage.getItem('was_in_builder');
            if (fromBuilder === 'true') {
                localStorage.removeItem('was_in_builder');
                navigate('/builder');
            } else {
                navigate('/admin');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-500">
            {/* Theme Toggle Positioned Top Right */}
            <div className="absolute top-8 right-8 z-50">
                <ThemeToggle />
            </div>

            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-mesh-gradient opacity-20" />
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-wizard-purple/5 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-wizard-accent/5 blur-[150px] rounded-full animate-pulse" />

            <div className="max-w-md w-full relative z-10 transition-all duration-1000">
                <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent blur-2xl opacity-20" />
                <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden group">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-wizard-purple/30 to-transparent" />

                    {/* Header */}
                    <div className="text-center mb-10 relative">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-wizard-purple/10 border border-wizard-purple/20 rounded-3xl mb-8 shadow-[0_0_50px_rgba(157,80,187,0.1)] group-hover:scale-110 transition-transform duration-700">
                            <svg className="w-10 h-10 text-wizard-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-white mb-3 uppercase">
                            Create <span className="text-wizard-purple">Account</span>
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">
                            Join the identity forge
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">
                                    Full Name
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-wizard-purple/5 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="relative block w-full px-7 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-wizard-purple/40 focus:ring-0 transition-all font-black uppercase text-xs tracking-widest shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-white/[0.04]"
                                        placeholder="Enter your name..."
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">
                                    Email Address
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-wizard-purple/5 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="relative block w-full px-7 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-wizard-purple/40 focus:ring-0 transition-all font-black uppercase text-xs tracking-widest shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-white/[0.04]"
                                        placeholder="Enter your email..."
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">
                                    Password
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-wizard-purple/5 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="relative block w-full px-7 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-wizard-purple/40 focus:ring-0 transition-all font-black uppercase text-xs tracking-widest shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-white/[0.04]"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">
                                    Confirm Password
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-wizard-purple/5 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="relative block w-full px-7 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-wizard-purple/40 focus:ring-0 transition-all font-black uppercase text-xs tracking-widest shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-white/[0.04]"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group/btn overflow-hidden bg-wizard-purple hover:bg-white text-white hover:text-black py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(157,80,187,0.2)] hover:shadow-[0_25px_50px_rgba(157,80,187,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                                            <span>Synthesizing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Forge Account</span>
                                            <svg className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7m0 0l-7 7m7-7H6" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center pt-8 border-t border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">
                                Already Identified?{' '}
                                <Link to="/login" className="text-wizard-purple hover:text-white transition-colors ml-2 underline underline-offset-4">
                                    Return to Gateway
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer Credits */}
                <div className="mt-12 text-center text-[8px] font-black uppercase tracking-[0.6em] text-gray-800 pointer-events-none">
                    EYE-DENTITY REGISTRY &copy; 2025 // IDENTITY FORGE
                </div>
            </div>
        </div>
    );
};
