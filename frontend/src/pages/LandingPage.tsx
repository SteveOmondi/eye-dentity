import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-mesh-gradient smooth-scroll overflow-x-hidden">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-wizard-accent/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-wizard-purple/5 blur-[120px] rounded-full" />
            </div>

            {/* Navigation */}
            <nav className="glass-header sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-wizard-accent rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(196,240,66,0.3)] transition-transform group-hover:scale-110">
                                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-transparent italic">
                                EYE-DENTITY
                            </h1>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-wizard-accent transition-colors">Features</a>
                            <a href="#how-it-works" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-wizard-accent transition-colors">Protocol</a>
                            <Link
                                to="/login"
                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-wizard-accent transition-colors"
                            >
                                Sign In
                            </Link>
                            <ThemeToggle />
                            <Link
                                to="/builder"
                                className="bg-wizard-accent text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(196,240,66,0.2)] hover:shadow-[0_0_40px_rgba(196,240,66,0.4)] transition-all hover:scale-105 active:scale-95"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 sm:pt-32 sm:pb-48">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                            <span className="w-2 h-2 rounded-full bg-wizard-accent shadow-[0_0_8px_var(--wizard-accent)]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-wizard-accent">AI-Powered Identity Builder</span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
                            BUILD YOUR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-wizard-accent via-white to-wizard-purple animate-gradient-x">PROFESSIONAL</span> <br />
                            LEGACY
                        </h1>
                        <p className="mt-8 max-w-2xl mx-auto text-lg text-gray-400 leading-relaxed font-medium">
                            The ultimate tool for modern professionals. Use our advanced AI to craft a stunning digital presence, custom domains, and premium hosting in under 5 minutes.
                        </p>
                        <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                to="/builder"
                                className="group relative inline-flex items-center justify-center px-10 py-5 bg-wizard-accent text-black rounded-2xl text-sm font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(196,240,66,0.15)] hover:shadow-[0_25px_50px_rgba(196,240,66,0.25)] transition-all transform hover:-translate-y-1 hover:scale-[1.02]"
                            >
                                Start Building Now
                                <svg className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-10 py-5 glass-card rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                            >
                                Sign In
                            </Link>
                        </div>

                        {/* Social Proof Placeholder */}
                        <div className="mt-24 pt-12 border-t border-white/5 opacity-50 grayscale contrast-125">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-gray-500">Trusted by modern professionals</p>
                            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
                                <span className="text-2xl font-black tracking-tighter">DESIGNER.</span>
                                <span className="text-2xl font-black tracking-tighter italic">CONSULT.</span>
                                <span className="text-2xl font-black tracking-tighter">LEGAL+</span>
                                <span className="text-2xl font-black tracking-tighter italic underline decoration-wizard-accent">CREATIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <span className="text-wizard-accent text-xs font-black uppercase tracking-[0.3em] block mb-4">Core Capabilities</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
                            Everything You Need <br />
                            to Succeed Online
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <div className="glass-card group p-8 rounded-[2.5rem] border-white/5 hover:border-wizard-accent/30 transition-all duration-500 relative">
                            <div className="w-14 h-14 bg-wizard-accent/10 border border-wizard-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black mb-4 group-hover:text-wizard-accent transition-colors">AI-Powered Design</h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Intelligent assistant that crafts perfectly tailored content and layouts based on your expertise.
                            </p>
                            <div className="absolute top-8 right-8 w-1.5 h-1.5 rounded-full bg-wizard-accent opacity-0 group-hover:opacity-100 transition-opacity blur-[2px]" />
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card group p-8 rounded-[2.5rem] border-white/5 hover:border-wizard-purple/30 transition-all duration-500 relative">
                            <div className="w-14 h-14 bg-wizard-purple/10 border border-wizard-purple/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-wizard-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black mb-4 group-hover:text-wizard-purple transition-colors">Elite Templates</h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Choice from a curated selection of highly professional, mobile-optimized premium themes.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card group p-8 rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all duration-500 relative">
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black mb-4 transition-colors">Custom Domain</h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Seamless domain registration and management to solidify your professional brand identity.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="glass-card group p-8 rounded-[2.5rem] border-white/5 hover:border-wizard-accent/30 transition-all duration-500 relative">
                            <div className="w-14 h-14 bg-wizard-accent/10 border border-wizard-accent/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7 text-wizard-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black mb-4 group-hover:text-wizard-accent transition-colors">Global Edge</h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Enterprise-grade hosting with global CDN, SSL, and maximum reliability for your site.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <span className="text-wizard-purple text-xs font-black uppercase tracking-[0.3em] block mb-4">The Process</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
                            Your Journey to Digital <br />
                            Excellence
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[2.75rem] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Step 1 */}
                        <div className="relative z-10 text-center group">
                            <div className="flex items-center justify-center mb-10">
                                <div className="w-20 h-20 bg-[#0d0d0d] border-2 border-wizard-accent rounded-full flex items-center justify-center text-2xl font-black text-wizard-accent shadow-[0_0_30px_rgba(196,240,66,0.2)] group-hover:scale-110 transition-transform">
                                    1
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-wizard-accent transition-colors">
                                Define Your Identity
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Share your expertise through a conversational AI interface or a structured guide.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 text-center group">
                            <div className="flex items-center justify-center mb-10">
                                <div className="w-20 h-20 bg-[#0d0d0d] border-2 border-wizard-purple rounded-full flex items-center justify-center text-2xl font-black text-wizard-purple shadow-[0_0_30px_rgba(157,80,187,0.2)] group-hover:scale-110 transition-transform">
                                    2
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-wizard-purple transition-colors">
                                Design Your World
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Choose from elite templates and customize with glowing color palettes and refined gradients.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 text-center group">
                            <div className="flex items-center justify-center mb-10 text-black">
                                <div className="w-20 h-20 bg-wizard-accent border-2 border-wizard-accent rounded-full flex items-center justify-center text-2xl font-black shadow-[0_0_40px_rgba(196,240,66,0.3)] group-hover:scale-110 transition-transform">
                                    3
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-wizard-accent transition-colors">
                                Launch Your Legacy
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                                Secure your custom domain, activate premium hosting, and go live with one final click.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-24">
                        <Link
                            to="/builder"
                            className="inline-flex items-center justify-center px-10 py-5 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-wizard-accent transition-all transform hover:-translate-y-1"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black/50 border-t border-white/5 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-wizard-accent rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12l-6-6h12l-6 6z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black tracking-tighter italic">EYE-DENTITY</h3>
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                Redefining professional identity through the power of AI and premium design.
                            </p>
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-8 md:gap-12">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 font-bold">Product</h4>
                                <ul className="space-y-4">
                                    <li><Link to="/builder" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors">Website Builder</Link></li>
                                    <li><a href="#" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors">Premium Themes</a></li>
                                    <li><a href="#" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors">AI Services</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 font-bold">Resources</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors">Documentation</a></li>
                                    <li><a href="#" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors">Support Center</a></li>
                                    <li><Link to="/admin" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors italic">Admin Dashboard</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 font-bold">Connect</h4>
                                <ul className="space-y-4">
                                    <li><Link to="/login" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors">Sign In</Link></li>
                                    <li><Link to="/register" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors">Create Account</Link></li>
                                    <li><a href="#" className="text-sm text-gray-400 font-medium hover:text-wizard-accent transition-colors">Expert Help</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                            &copy; 2025 EYE-IDENTITY. SYSTEM ACTIVATED.
                        </p>
                        <div className="flex gap-8">
                            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-wizard-accent transition-colors">Privacy</a>
                            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-wizard-accent transition-colors">Terms</a>
                            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-wizard-accent transition-colors">Agency</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
