import { useEffect, useState } from 'react';
import { adminApi, type Website } from '../../api/admin';

export const AdminWebsites = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWebsites();
  }, [page, statusFilter]);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getWebsites(page, 20, statusFilter || undefined);
      setWebsites(response.websites);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch websites:', err);
      setError(err.response?.data?.error || 'Failed to load websites');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'text-gray-500 border-gray-500/30 bg-gray-500/5',
      GENERATING: 'text-blue-400 border-blue-400/30 bg-blue-400/5 shadow-[0_0_10px_rgba(96,165,250,0.1)]',
      GENERATED: 'text-wizard-accent border-wizard-accent/30 bg-wizard-accent/5 shadow-[0_0_10px_rgba(196,240,66,0.1)]',
      DEPLOYING: 'text-wizard-purple border-wizard-purple/30 bg-wizard-purple/5 shadow-[0_0_10px_rgba(157,80,187,0.1)]',
      LIVE: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5 shadow-[0_0_10px_rgba(52,211,153,0.1)]',
      ERROR: 'text-red-400 border-red-400/30 bg-red-400/5',
      SUSPENDED: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
    };
    return colors[status] || 'text-gray-500 border-gray-500/30 bg-gray-500/5';
  };

  const filteredWebsites = websites.filter((website) =>
    website.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && websites.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-wizard-accent"></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Mapping Digital Web...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">DOMAIN ARCHIVE</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Global Website Presence & Generation Status</p>
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
              placeholder="SEARCH DOMAIN NODES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-wizard-accent/50 focus:ring-1 focus:ring-wizard-accent/50 transition-all font-medium"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-wizard-accent transition-all cursor-pointer hover:bg-white/[0.05]"
            >
              <option value="" className="bg-[#141414]">All Core Status</option>
              <option value="PENDING" className="bg-[#141414]">Pending</option>
              <option value="GENERATING" className="bg-[#141414]">Generating</option>
              <option value="GENERATED" className="bg-[#141414]">Generated</option>
              <option value="LIVE" className="bg-[#141414]">Live Site</option>
              <option value="ERROR" className="bg-[#141414]">Core Failure</option>
            </select>
            <button
              onClick={fetchWebsites}
              className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest group"
            >
              <svg className="w-4 h-4 text-wizard-accent group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card border-red-500/20 rounded-3xl p-6 bg-red-500/5 text-red-500 text-xs font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      {/* Grid Layout for Websites */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWebsites.map((website) => (
          <div
            key={website.id}
            className="group glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all duration-500 flex flex-col hover:-translate-y-2"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-wizard-accent/30 group-hover:bg-wizard-accent/5 transition-all">
                <svg className="w-8 h-8 text-wizard-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <span
                className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${getStatusColor(
                  website.status
                )}`}
              >
                {website.status}
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-black text-white tracking-tight group-hover:text-wizard-accent transition-colors mb-2 truncate">
                {website.domain}
              </h3>
              {website.deploymentUrl && (
                <p className="text-[10px] font-bold text-gray-600 truncate mb-6 uppercase tracking-widest group-hover:text-gray-400">
                  {website.deploymentUrl}
                </p>
              )}

              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-wizard-purple" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{website.template.name}</span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-wizard-accent to-[#6a11cb] rounded-xl flex items-center justify-center text-black font-black text-[10px]">
                  {(website.user.name || website.user.email)[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white group-hover:text-wizard-accent transition-colors truncate max-w-[120px]">
                    {website.user.name || 'Anonymous'}
                  </span>
                  <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Creator</span>
                </div>
              </div>
              <button className="flex items-center gap-2 text-[10px] font-black text-wizard-accent hover:text-white transition-colors uppercase tracking-[0.2em] group/btn">
                Access
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="glass-card rounded-3xl px-8 py-6 border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Nodes Visible: {(page - 1) * pagination.limit + 1} &ndash;{' '}
            {Math.min(page * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} SITES
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
  );
};
