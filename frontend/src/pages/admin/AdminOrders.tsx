import { useEffect, useState } from 'react';
import { adminApi, type Order } from '../../api/admin';

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrders(page, 20, statusFilter || undefined);
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
      PROCESSING: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
      COMPLETED: 'text-wizard-accent border-wizard-accent/30 bg-wizard-accent/5 shadow-[0_0_10px_rgba(196,240,66,0.1)]',
      FAILED: 'text-red-400 border-red-400/30 bg-red-400/5',
      CANCELED: 'text-gray-500 border-gray-500/30 bg-gray-500/5',
    };
    return colors[status] || 'text-gray-500 border-gray-500/30 bg-gray-500/5';
  };

  const filteredOrders = orders.filter((order) =>
    order.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-wizard-accent"></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Decrypting Financial Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">REVENUE LEDGER</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Real-time Transactional Data & Fulfillment</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-[2rem] p-8 border-white/5 relative overflow-hidden group hover:border-wizard-accent/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 text-wizard-accent">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Gross Revenue</p>
          <p className="text-4xl font-black text-white tracking-tighter mb-2">
            ${orders.reduce((sum, order) => sum + (order.status === 'COMPLETED' ? order.totalAmount : 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-wizard-accent shadow-[0_0_8px_#c4f042]" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Earnings</p>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-8 border-white/5 relative overflow-hidden group hover:border-wizard-accent/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 text-wizard-accent">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Successful Logs</p>
          <p className="text-4xl font-black text-white tracking-tighter mb-2">
            {orders.filter((o) => o.status === 'COMPLETED').length}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-wizard-accent/50" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fulfillment Complete</p>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-8 border-white/5 relative overflow-hidden group hover:border-wizard-purple/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 text-wizard-purple">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Pending Streams</p>
          <p className="text-4xl font-black text-white tracking-tighter mb-2">
            {orders.filter((o) => o.status === 'PENDING').length}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-wizard-purple shadow-[0_0_8px_#9d50bb]" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Awaiting Confirmation</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-3xl p-6 border-white/5">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="SEARCH TRANSACTION RECORDS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-wizard-accent transition-all"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-wizard-accent transition-all cursor-pointer hover:bg-white/[0.05]"
            >
              <option value="" className="bg-[#141414]">All Stream Status</option>
              <option value="PENDING" className="bg-[#141414]">Pending</option>
              <option value="PROCESSING" className="bg-[#141414]">Processing</option>
              <option value="COMPLETED" className="bg-[#141414]">Completed</option>
              <option value="FAILED" className="bg-[#141414]">Failed</option>
            </select>
            <button
              onClick={fetchOrders}
              className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest group"
            >
              <svg className="w-4 h-4 text-wizard-accent group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-Sync
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card border-red-500/20 rounded-3xl p-6 bg-red-500/5 text-red-500 text-xs font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Log ID
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Target Identity
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Value Flow
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="text-[10px] font-mono font-black text-gray-600 group-hover:text-wizard-accent transition-colors">
                      {order.id.substring(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-wizard-accent transition-all">
                        <svg className="w-5 h-5 text-wizard-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-white group-hover:text-wizard-accent transition-colors tracking-tight">{order.domain}</p>
                        <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-tight">{order.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white tracking-tighter">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                        {order.hostingPlan} Plan Activated
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {order.completedAt && (
                        <span className="text-[8px] font-bold text-wizard-accent/50 uppercase tracking-widest mt-1">
                          Settled: {new Date(order.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Logs Visible: {(page - 1) * pagination.limit + 1} &ndash;{' '}
              {Math.min(page * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} RECORDS
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Forward
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
