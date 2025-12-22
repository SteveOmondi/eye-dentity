import { useEffect, useState } from 'react';
import { adminApi, type AdminDashboardData } from '../../api/admin';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await adminApi.getDashboardStats();
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-wizard-accent"></div>
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-500">Syncing System Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card border-red-500/20 rounded-3xl p-8 bg-red-500/5">
        <p className="text-red-500 font-bold text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const statsCards = [
    {
      title: 'Total Users',
      value: data.stats.totalUsers,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      accent: 'wizard-accent',
      shadow: 'rgba(196,240,66,0.2)',
    },
    {
      title: 'Active Sites',
      value: data.stats.activeWebsites,
      subtitle: `${data.stats.totalWebsites} total nodes`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      accent: 'wizard-purple',
      shadow: 'rgba(157,80,187,0.2)',
    },
    {
      title: 'Orders',
      value: data.stats.totalOrders,
      subtitle: `${data.stats.completedOrders} completed`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      accent: 'wizard-accent',
      shadow: 'rgba(196,240,66,0.2)',
    },
    {
      title: 'Revenue',
      value: `$${data.stats.monthlyRevenue.toLocaleString()}`,
      subtitle: `$${data.stats.totalRevenue.toLocaleString()} total`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: 'wizard-purple',
      shadow: 'rgba(157,80,187,0.2)',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">DASHBOARD</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">System Performance Metrics</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-wizard-accent/5 border border-wizard-accent/20 rounded-xl text-[10px] font-black text-wizard-accent uppercase tracking-widest">
            Status: Operational
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="group relative glass-card p-8 rounded-[2rem] border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
          >
            <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-${card.accent}`}>
              {card.icon}
            </div>
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">{card.title}</p>
              <h3 className="text-4xl font-black text-white tracking-tighter mb-2">{card.value}</h3>
              {card.subtitle && (
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{card.subtitle}</p>
              )}
            </div>
            <div className={`mt-6 inline-flex p-2.5 rounded-xl bg-${card.accent}/10 text-${card.accent} shadow-[0_0_15px_${card.shadow}] transition-all`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">RECENT USERS</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Latest system entries</p>
            </div>
            <Link
              to="/admin/users"
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {data.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-wizard-accent to-emerald-500 rounded-2xl flex items-center justify-center text-black font-black text-sm shadow-lg shadow-wizard-accent/10">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase text-white truncate group-hover:text-wizard-accent transition-colors">
                    {user.name || 'Anonymous User'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 truncate mt-1">{user.email}</p>
                </div>
                <span
                  className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg ${user.role === 'ADMIN'
                    ? 'bg-wizard-purple/20 text-wizard-purple border border-wizard-purple/30 shadow-[0_0_10px_rgba(157,80,187,0.1)]'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                >
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">LIVE REVENUE</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time transactions</p>
            </div>
            <Link
              to="/admin/orders"
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
              All orders
            </Link>
          </div>
          <div className="space-y-4">
            {data.recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-wizard-accent shadow-[0_0_8px_#c4f042]" />
                    <p className="text-xs font-black uppercase text-white tracking-widest truncate group-hover:text-wizard-accent transition-colors">
                      {order.domain}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg ${order.status === 'COMPLETED'
                      ? 'bg-wizard-accent/20 text-wizard-accent border border-wizard-accent/30 shadow-[0_0_10px_rgba(196,240,66,0.1)]'
                      : order.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-500">{order.user.email}</p>
                  <p className="text-sm font-black text-white tracking-tight">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
