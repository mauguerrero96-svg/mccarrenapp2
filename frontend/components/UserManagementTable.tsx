'use client';

import { useState, useMemo } from 'react';
import EmptyState from './ui/EmptyState';

interface User {
  id: string;
  email: string;
  role: string;
  club?: string;
  status: 'active' | 'inactive';
}

interface UserManagementTableProps {
  users: User[];
  onEditRole?: (userId: string, newRole: string) => void;
  onToggleStatus?: (userId: string) => void;
  onDelete?: (userId: string) => void;
}

export default function UserManagementTable({
  users,
  onEditRole,
  onToggleStatus,
  onDelete,
}: UserManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal! < bVal!) return sortDirection === 'asc' ? -1 : 1;
        if (aVal! > bVal!) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, roleFilter, sortField, sortDirection]);

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof User }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-slate-400 group-hover:text-tennis-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-tennis-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-tennis-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none block w-full pl-3 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="player">Player</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table - Card Style */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-tennis-green-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-tennis-navy-700 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('email')}
                  className="group flex items-center space-x-2 hover:text-tennis-green-700 transition-colors focus:outline-none"
                >
                  <span>Email</span>
                  <SortIcon field="email" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-tennis-navy-700 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('role')}
                  className="group flex items-center space-x-2 hover:text-tennis-green-700 transition-colors focus:outline-none"
                >
                  <span>Role</span>
                  <SortIcon field="role" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-tennis-navy-700 uppercase tracking-wider">
                Club
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-tennis-navy-700 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('status')}
                  className="group flex items-center space-x-2 hover:text-tennis-green-700 transition-colors focus:outline-none"
                >
                  <span>Status</span>
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-tennis-navy-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">No users found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {searchTerm || roleFilter !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first user'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-tennis-green-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => onEditRole?.(user.id, e.target.value)}
                      className="text-xs font-medium border border-slate-200 rounded-full px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-tennis-green-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
                    >
                      <option value="admin">Admin</option>
                      <option value="organizer">Organizer</option>
                      <option value="player">Player</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {user.club || <span className="text-slate-400 italic">None</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${user.status === 'active'
                          ? 'bg-green-50 text-green-700 ring-green-600/20'
                          : 'bg-red-50 text-red-700 ring-red-600/20'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                        }`}></span>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => onToggleStatus?.(user.id)}
                        className={`text-xs font-medium transition-colors focus:outline-none ${user.status === 'active'
                            ? 'text-slate-500 hover:text-red-600'
                            : 'text-tennis-green-600 hover:text-tennis-green-700'
                          }`}
                      >
                        {user.status === 'active' ? 'Ban User' : 'Unban User'}
                      </button>
                      <button
                        onClick={() => onDelete?.(user.id)}
                        className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors focus:outline-none"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
