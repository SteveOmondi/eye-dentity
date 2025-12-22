import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Websites',
      path: '/admin/websites',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-wizard-step-bg border-r border-white/5 shadow-2xl overflow-hidden`}
        style={{ width: '280px' }}
      >
        {/* Subtle Background Glow in Sidebar */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-wizard-purple/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="h-full flex flex-col relative z-10">
          {/* Logo */}
          <div className="p-8 border-b border-white/5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-wizard-accent rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(196,240,66,0.2)] group-hover:shadow-[0_0_30px_rgba(196,240,66,0.3)] transition-all">
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-text-primary">
                  EYE-DENTITY
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wizard-accent">Admin Core</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              Management
            </p>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 group ${active
                    ? 'bg-white/5 text-wizard-accent border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.2)]'
                    : 'text-gray-500 hover:text-text-primary hover:bg-white/[0.02]'
                    }`}
                >
                  <div className={`p-2 rounded-xl transition-all ${active ? 'bg-wizard-accent/10 text-wizard-accent' : 'bg-transparent group-hover:text-text-primary'
                    }`}>
                    {item.icon}
                  </div>
                  <span>{item.name}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 bg-wizard-accent rounded-full shadow-[0_0_10px_#c4f042]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-6 mt-auto border-t border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-gradient-to-br from-wizard-purple to-[#6a11cb] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-tight text-text-primary truncate">Administrator</p>
                <p className="text-[10px] font-bold text-gray-500 truncate">Core System Access</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-500 ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}
      >
        {/* Top Bar */}
        <header className="bg-header-bg backdrop-blur-md border-b border-white/5 sticky top-0 z-30 font-sans">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <svg className={`w-5 h-5 text-gray-500 group-hover:text-text-primary transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
                System <span className="text-text-primary">Overview</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-wizard-accent rounded-full animate-pulse shadow-[0_0_10px_#c4f042]"></span>
              </button>

              <div className="h-8 w-px bg-white/10 mx-2" />

              <Link
                to="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-wizard-purple/10 border border-wizard-purple/20 text-[10px] font-black uppercase tracking-widest text-wizard-purple hover:bg-wizard-purple/20 transition-all"
              >
                <span>Live Site</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-10 relative">
          {/* Subtle Background Mesh for Content Area */}
          <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-wizard-accent/5 blur-[150px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>

  );
};
