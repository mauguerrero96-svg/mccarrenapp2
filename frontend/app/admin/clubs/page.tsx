'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase/client';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useToast } from '../../../components/ui/ToastContainer';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import Input from '../../../components/ui/Input';
import EmptyState from '../../../components/ui/EmptyState';

interface Club {
  id: string;
  name: string;
  created_at: string;
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs_mccarren_tournament')
        .select('*')
        .order('name');

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error loading clubs:', error);
      showToast('Error loading clubs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('clubs_mccarren_tournament')
        .insert([{ name: newClubName.trim() }])
        .select()
        .single();

      if (error) throw error;

      setClubs([...clubs, data]);
      setNewClubName('');
      setFormError(null);
      setShowCreateModal(false);
      showToast('Club created successfully', 'success');
    } catch (error: any) {
      console.error('Error creating club:', error);
      setFormError(error.message || 'Error creating club');
      showToast(`Error creating club: ${error.message}`, 'error');
    }
  };

  const handleDeleteClick = (clubId: string) => {
    setClubToDelete(clubId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clubToDelete) return;

    try {
      const { error } = await supabase
        .from('clubs_mccarren_tournament')
        .delete()
        .eq('id', clubToDelete);

      if (error) throw error;

      setClubs(clubs.filter((club) => club.id !== clubToDelete));
      showToast('Club deleted successfully', 'success');
      setDeleteModalOpen(false);
      setClubToDelete(null);
    } catch (error: any) {
      console.error('Error deleting club:', error);
      showToast(`Error deleting club: ${error.message}`, 'error');
    }
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clubs Management</h1>
          <p className="text-gray-600 mt-1">Manage tennis clubs in the system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Create Club
        </button>
      </div>


      {/* Search and Stats */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div className="text-sm text-gray-500">
          {filteredClubs.length} {filteredClubs.length === 1 ? 'club' : 'clubs'}
        </div>
      </div>

      {/* Clubs List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClubs.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <EmptyState
                    title="No clubs found"
                    description={searchTerm ? 'Try adjusting your search' : 'Get started by creating your first club'}
                    action={
                      !searchTerm
                        ? {
                          label: 'Create Club',
                          onClick: () => setShowCreateModal(true),
                        }
                        : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              filteredClubs.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {club.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(club.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteClick(club.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewClubName('');
          setFormError(null);
        }}
        title="Create New Club"
        size="md"
      >
        <form onSubmit={handleCreateClub} className="space-y-4">
          <FormField label="Club Name" required error={formError || undefined}>
            <Input
              type="text"
              value={newClubName}
              onChange={(e) => {
                setNewClubName(e.target.value);
                setFormError(null);
              }}
              placeholder="Enter club name"
              required
              error={!!formError}
            />
          </FormField>
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setNewClubName('');
                setFormError(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setClubToDelete(null);
        }}
        title="Delete Club"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this club? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setClubToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
