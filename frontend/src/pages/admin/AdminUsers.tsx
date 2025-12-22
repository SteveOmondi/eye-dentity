import { useEffect, useState } from 'react';
import { adminApi, type User } from '../../api/admin';

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers(page, 20);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      // Refresh users list
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-wizard-accent"></div>
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Identifying Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">USER DIRECTORY</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Core Access & Permissions Management</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-[2rem] p-6 border-white/5 relative overflow-hidden group hover:border-wizard-accent/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-wizard-accent">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">System Population</p>
          <p className="text-4xl font-black text-white tracking-tighter mb-1">{pagination?.totalCount || 0}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-wizard-accent shadow-[0_0_8px_#c4f042]" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Identified</p>
          </div>
        </div>
        <div className="glass-card rounded-[2rem] p-6 border-white/5 relative overflow-hidden group hover:border-wizard-purple/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-wizard-purple">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Access Privileges</p>
          <p className="text-4xl font-black text-white tracking-tighter mb-1">{users.filter((u) => u.role === 'ADMIN').length}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-wizard-purple shadow-[0_0_8px_#9d50bb]" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Admin Controllers</p>
          </div>
        </div>
        <div className="glass-card rounded-[2rem] p-6 border-white/5 relative overflow-hidden group hover:border-wizard-accent/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-wizard-accent">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Standard Access</p>
          <p className="text-4xl font-black text-white tracking-tighter mb-1">{users.filter((u) => u.role === 'USER').length}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-wizard-accent/50" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verified Members</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-3xl p-6 border-white/5">
        <div className="flex items-center gap-6">
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
              placeholder="LOCATE SYSTEM ENTRY BY NAME OR EMAIL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-wizard-accent/50 focus:ring-1 focus:ring-wizard-accent/50 transition-all"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest group"
          >
            <svg className="w-4 h-4 text-wizard-accent group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-Sync list
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card border-red-500/20 rounded-3xl p-6 bg-red-500/5 text-red-500 text-xs font-bold uppercase tracking-widest">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Entry Identity
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Core Role
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Resources
                </th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Identified On
                </th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                  Access Control
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-wizard-accent to-[#6a11cb] rounded-2xl flex items-center justify-center text-black font-black text-sm shadow-lg shadow-black/20">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-white group-hover:text-wizard-accent transition-colors">
                          {user.name || 'Anonymous Entry'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-tight">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg ${user.role === 'ADMIN'
                        ? 'bg-wizard-purple/20 text-wizard-purple border border-wizard-purple/30 shadow-[0_0_10px_rgba(157,80,187,0.1)]'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white group-hover:text-wizard-accent transition-colors">
                          {user._count?.websites || 0}
                        </span>
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">SITES</span>
                      </div>
                      <div className="w-px h-6 bg-white/5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white group-hover:text-wizard-accent transition-colors">
                          {user._count?.orders || 0}
                        </span>
                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">LOGS</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleUpdate(user.id, e.target.value as 'USER' | 'ADMIN')
                      }
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:border-wizard-accent focus:ring-1 focus:ring-wizard-accent transition-all cursor-pointer hover:bg-white/10"
                    >
                      <option value="USER" className="bg-[#141414] text-white">Member</option>
                      <option value="ADMIN" className="bg-[#141414] text-white">Overseer</option>
                    </select>
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
              Visible: {(page - 1) * pagination.limit + 1} &ndash;{' '}
              {Math.min(page * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} ENTRIES
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
