import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { ThemeToggle } from '../components/ThemeToggle';

export const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authApi.login({
                email: formData.email,
                password: formData.password,
            });

            // Store token
            localStorage.setItem('token', response.token);
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }

            // Redirect to admin dashboard
            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-wizard-accent/5 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-wizard-purple/5 blur-[150px] rounded-full animate-pulse" />

            <div className="max-w-md w-full relative z-10 transition-all duration-1000">
                <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent blur-2xl opacity-20" />
                <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl relative overflow-hidden group">
                    {/* Decorative Top Accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-wizard-accent/30 to-transparent" />

                    {/* Header */}
                    <div className="text-center mb-12 relative">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-wizard-accent/10 border border-wizard-accent/20 rounded-3xl mb-8 shadow-[0_0_50px_rgba(196,240,66,0.1)] group-hover:scale-110 transition-transform duration-700">
                            <svg className="w-10 h-10 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-white mb-3 uppercase">
                            Secure <span className="text-wizard-accent">Link</span>
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse">
                            Awaiting Authorization Sequence
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {/* Email */}
                            <div className="space-y-3">
                                <label htmlFor="email" className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 ml-2">
                                    Identity Identifier (Email)
                                </label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-wizard-accent/5 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="relative block w-full px-7 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-wizard-accent/40 focus:ring-0 transition-all font-black uppercase text-xs tracking-widest shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-white/[0.04]"
                                        placeholder="ENTER EMAIL ADDRESS..."
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-2">
                                    <label htmlFor="password" className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                                        Access Key (Password)
                                    </label>
                                    <a href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-wizard-accent/40 hover:text-wizard-accent transition-colors">
                                        Lost Key?
                                    </a>
                                </div>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-wizard-accent/5 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="relative block w-full px-7 py-5 bg-white/[0.02] border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:border-wizard-accent/40 focus:ring-0 transition-all font-black uppercase text-xs tracking-widest shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] hover:bg-white/[0.04]"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center px-2">
                            <div className="relative flex items-center cursor-pointer group/check">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="peer sr-only"
                                />
                                <div className="w-10 h-5 bg-white/5 border border-white/10 rounded-full transition-all peer-checked:bg-wizard-accent/20 peer-checked:border-wizard-accent/30" />
                                <div className="absolute left-1 w-3 h-3 bg-gray-600 rounded-full transition-all peer-checked:left-6 peer-checked:bg-wizard-accent peer-checked:shadow-[0_0_10px_rgba(196,240,66,0.8)]" />
                            </div>
                            <label htmlFor="rememberMe" className="ml-4 block text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 cursor-pointer group-hover/check:text-gray-400 transition-colors">
                                Sustain Session Linkage
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group/btn overflow-hidden bg-wizard-accent hover:bg-white text-black py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(196,240,66,0.2)] hover:shadow-[0_25px_50px_rgba(196,240,66,0.3)] transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />
                                            <span>Validating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Establish Access</span>
                                            <svg className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* Register Link */}
                        <div className="text-center pt-8 border-t border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700">
                                New Identity Segment?{' '}
                                <Link to="/register" className="text-wizard-accent hover:text-white transition-colors ml-2 underline underline-offset-4">
                                    Initiate Registration
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer Credits */}
                <div className="mt-12 text-center text-[8px] font-black uppercase tracking-[0.6em] text-gray-800 pointer-events-none">
                    EYE-DENTITY PROTOCOL &copy; 2025 // SECURE GATEWAY
                </div>
            </div>
        </div>
    );
};
