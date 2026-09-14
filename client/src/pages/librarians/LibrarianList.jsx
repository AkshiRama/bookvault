import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const LibrarianList = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLibrarian, setEditingLibrarian] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', status: 'active' });
  const [formLoading, setFormLoading] = useState(false);

  // Reset Password Modal
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [targetLibrarian, setTargetLibrarian] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Delete Dialog
  const [toDelete, setToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchLibrarians = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarians');
      setLibrarians(res.data.data);
    } catch (err) {
      error('Failed to load librarian roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrarians();
  }, []);

  const handleOpenAdd = () => {
    setEditingLibrarian(null);
    setFormData({ name: '', email: '', password: 'Librarian@123', status: 'active' });
    setModalOpen(true);
  };

  const handleOpenEdit = (lib) => {
    setEditingLibrarian(lib);
    setFormData({ name: lib.name, email: lib.email, status: lib.status });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editingLibrarian) {
        await api.put(`/librarians/${editingLibrarian._id}`, formData);
        success('Librarian details updated successfully');
      } else {
        await api.post('/librarians', formData);
        success('New librarian account created');
      }
      setModalOpen(false);
      fetchLibrarians();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save librarian');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (lib) => {
    try {
      await api.patch(`/librarians/${lib._id}/status`);
      success(`Status updated for ${lib.name}`);
      fetchLibrarians();
    } catch (err) {
      error('Failed to toggle status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }
    try {
      setPwdLoading(true);
      await api.post(`/librarians/${targetLibrarian._id}/reset-password`, { newPassword });
      success(`Password reset successfully for ${targetLibrarian.name}`);
      setPwdModalOpen(false);
      setNewPassword('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/librarians/${toDelete._id}`);
      success('Librarian account removed');
      setToDelete(null);
      fetchLibrarians();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete librarian');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Librarian Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Admin-only staff management: grant librarian credentials, activate/deactivate accounts, and manage passwords.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Librarian
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : librarians.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No librarians created"
          description="Register your library team members to delegate day-to-day book circulation."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Staff Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {librarians.map((lib) => (
                  <tr key={lib._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {lib.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{lib.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{lib.email}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(lib)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge variant={lib.status === 'active' ? 'success' : 'danger'}>
                          {lib.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(lib.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setTargetLibrarian(lib);
                            setPwdModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lib)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Librarian"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setToDelete(lib)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Librarian"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLibrarian ? 'Edit Librarian Account' : 'Create Librarian Account'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {!editingLibrarian && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password *
              </label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingLibrarian ? 'Update' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={pwdModalOpen}
        onClose={() => setPwdModalOpen(false)}
        title={`Reset Password for ${targetLibrarian?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              New Password *
            </label>
            <input
              type="text"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 chars)"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPwdModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs disabled:opacity-50"
            >
              {pwdLoading ? 'Resetting...' : 'Confirm Reset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        title="Delete Librarian Account"
        message={`Are you sure you want to permanently revoke librarian access for "${toDelete?.name}"?`}
      />
    </div>
  );
};
