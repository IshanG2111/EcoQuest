'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Award,
  Flame,
} from 'lucide-react';

interface ManagedUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  points: number;
  streak: number;
  last_active?: string;
  createdAt?: string;
}

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [stats, setStats] = useState<{ totalUsers: number; adminCount: number; userCount: number }>({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'; points: number; streak: number }>({
    role: 'USER',
    points: 0,
    streak: 0,
  });
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (query = searchQuery) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.users || []);
        if (json.stats) setStats(json.stats);
      } else {
        showMsg('error', json.error || 'Failed to load user records.');
      }
    } catch (err: any) {
      showMsg('error', err.message || 'Network error fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const startEditUser = (user: ManagedUser) => {
    setEditingUserId(user.id);
    setEditFormData({
      role: user.role,
      points: user.points,
      streak: user.streak,
    });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const saveUserEdit = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          role: editFormData.role,
          points: Number(editFormData.points),
          streak: Number(editFormData.streak),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showMsg('success', 'User profile & permissions updated successfully.');
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  role: editFormData.role,
                  points: Number(editFormData.points),
                  streak: Number(editFormData.streak),
                }
              : u
          )
        );
        setEditingUserId(null);
      } else {
        showMsg('error', json.error || 'Failed to update user.');
      }
    } catch (err: any) {
      showMsg('error', err.message || 'Error updating user.');
    }
  };

  const handleDeleteUser = async (user: ManagedUser) => {
    if (!confirm(`Are you sure you want to delete user account "${user.display_name}" (${user.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showMsg('success', `User ${user.display_name} has been removed.`);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      } else {
        showMsg('error', json.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      showMsg('error', err.message || 'Error deleting user.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" /> User Access & Permissions Management
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage user account roles, EcoPoints, streaks, and platform administrative privileges.
          </p>
        </div>
        <button
          onClick={() => fetchUsers(searchQuery)}
          className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 animate-in fade-in ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
          }`}
        >
          {actionMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#11131c] border border-zinc-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{stats.totalUsers}</div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Registered Learner Accounts</span>
        </div>

        <div className="bg-[#11131c] border border-zinc-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Administrator Privileges</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{stats.adminCount}</div>
          <span className="text-[10px] text-zinc-500 mt-1 block">ADMIN / SUPER_ADMIN Accounts</span>
        </div>

        <div className="bg-[#11131c] border border-zinc-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Regular Learners</span>
            <UserCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">{stats.userCount}</div>
          <span className="text-[10px] text-zinc-500 mt-1 block">USER Role Accounts</span>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by display name or email..."
            className="w-full bg-[#11131c] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5"
        >
          Search
        </button>
      </form>

      {/* User Table */}
      <div className="bg-[#11131c] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 font-mono border-b border-zinc-800 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role / Permission</th>
                <th className="p-3.5">Points</th>
                <th className="p-3.5">Streak</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500 text-xs font-mono">
                    {loading ? 'Fetching user database...' : 'No users found matching query.'}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isEditing = editingUserId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/50 transition">
                      {/* Name & Avatar */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center font-bold text-sky-300 text-xs uppercase">
                            {u.display_name?.[0] || u.email[0]}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{u.display_name || 'Unnamed'}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: {u.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-3.5 text-zinc-300 font-mono">{u.email}</td>

                      {/* Role Selector */}
                      <td className="p-3.5">
                        {isEditing ? (
                          <select
                            value={editFormData.role}
                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                            className="bg-zinc-950 border border-sky-500 text-sky-300 text-xs rounded px-2 py-1 focus:outline-none font-mono"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                              u.role === 'SUPER_ADMIN'
                                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                : u.role === 'ADMIN'
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        )}
                      </td>

                      {/* Points */}
                      <td className="p-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFormData.points}
                            onChange={(e) => setEditFormData({ ...editFormData, points: parseInt(e.target.value) || 0 })}
                            className="w-20 bg-zinc-950 border border-sky-500 text-white text-xs rounded px-2 py-1 focus:outline-none font-mono"
                          />
                        ) : (
                          <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-400" /> {u.points}
                          </span>
                        )}
                      </td>

                      {/* Streak */}
                      <td className="p-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editFormData.streak}
                            onChange={(e) => setEditFormData({ ...editFormData, streak: parseInt(e.target.value) || 0 })}
                            className="w-16 bg-zinc-950 border border-sky-500 text-white text-xs rounded px-2 py-1 focus:outline-none font-mono"
                          />
                        ) : (
                          <span className="font-mono text-orange-400 font-bold flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-orange-400" /> {u.streak}d
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="p-3.5 text-zinc-400 font-mono text-[11px]">{u.last_active || 'N/A'}</td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveUserEdit(u.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] font-medium transition inline-flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditUser(u)}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded transition inline-flex items-center gap-1 text-[11px]"
                              title="Edit Permissions & Points"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded transition inline-flex items-center gap-1 text-[11px]"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
