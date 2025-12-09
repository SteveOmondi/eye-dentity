import { Link } from 'react-router-dom';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-600">Eye-Dentity</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                            Build Your Professional Website
                            <span className="block text-blue-600 mt-2">With AI-Powered Design</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
                            Create stunning, professional websites in minutes. No coding required.
                            Choose from beautiful templates, customize with AI, and launch your online presence today.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/builder"
                                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                            >
                                Start Building Now
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-600 text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-all"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Everything You Need to Succeed Online
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">
                            Powerful features to help you create and manage your professional website
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Design</h3>
                            <p className="text-gray-600">
                                Let AI help you create beautiful, professional designs tailored to your business
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Templates</h3>
                            <p className="text-gray-600">
                                Choose from a variety of stunning, mobile-responsive templates
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Domain</h3>
                            <p className="text-gray-600">
                                Get your own custom domain and professional email address
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Secure</h3>
                            <p className="text-gray-600">
                                Lightning-fast hosting with SSL security and 99.9% uptime guarantee
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            How It Works
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">
                            Get your website live in just a few simple steps
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                                    1
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                                Tell Us About Your Business
                            </h3>
                            <p className="text-gray-600 text-center">
                                Share your business details, services, and branding to help us understand your needs
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                                    2
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                                Choose Your Design
                            </h3>
                            <p className="text-gray-600 text-center">
                                Select from professional templates and customize colors to match your brand
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                                    3
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                                Launch Your Website
                            </h3>
                            <p className="text-gray-600 text-center">
                                Pick your domain, choose a hosting plan, and go live instantly
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/builder"
                            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Eye-Dentity</h3>
                            <p className="text-gray-400">
                                Build your professional online presence with AI-powered website design.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/builder" className="text-gray-400 hover:text-white transition-colors">
                                        Website Builder
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Templates
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Pricing
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">
                                        Admin
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Account */}
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Account</h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                                        Sign In
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                                        Sign Up
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 Eye-Dentity. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
