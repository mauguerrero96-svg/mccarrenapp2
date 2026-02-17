'use client';

import { useEffect, useState } from 'react';
import UserManagementTable from '../../../components/UserManagementTable';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useToast } from '../../../components/ui/ToastContainer';
import Modal from '../../../components/ui/Modal';

import CreateUserModal from '../../../components/admin/CreateUserModal';

interface User {
  id: string;
  email: string;
  role: string;
  club?: string;
  status: 'active' | 'inactive';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load users');
      }

      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      showToast(`Error loading users: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
      showToast('Role updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating role:', error);
      showToast(`Error updating role: ${error.message}`, 'error');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    const newStatus = userToUpdate.status === 'active' ? 'inactive' : 'active';
    const actionName = newStatus === 'active' ? 'unbanned' : 'banned';

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );
      showToast(`User ${actionName} successfully`, 'success');
    } catch (error: any) {
      console.error('Error toggling status:', error);
      showToast(`Error updating status: ${error.message}`, 'error');
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/admin/users?userId=${userToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setUsers((prev) => prev.filter((user) => user.id !== userToDelete));
      showToast('User deleted successfully', 'success');
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast(`Error deleting user: ${error.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-tennis-navy-900 tracking-tight">User Management</h1>
          <p className="text-slate-600 mt-2 text-lg">Manage users, roles, and access permissions</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-tennis-green-600 hover:bg-tennis-green-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      <UserManagementTable
        users={users}
        onEditRole={handleEditRole}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteClick}
      />

      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={() => {
          loadUsers();
          showToast('User created successfully', 'success');
        }}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete this user? This action cannot be undone and will permanently remove all their data.
          </p>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
