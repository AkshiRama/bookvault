import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { History } from 'lucide-react';

export const MyHistory = () => {
  const { error } = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/member/my-history');
        setHistory(res.data.data);
      } catch (err) {
        error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [error]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your history...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Borrowing History</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete ledger of all past books checked out and returned.
        </p>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No past borrowings recorded"
          description="Your completed loans will appear here once you check out and return books."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Book Title</th>
                  <th className="px-6 py-3.5">Author</th>
                  <th className="px-6 py-3.5">Issue Date</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Return Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-900">{h.book?.title}</td>
                    <td className="px-6 py-4 text-slate-600">{h.book?.author}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(h.issueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(h.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {h.returnDate ? new Date(h.returnDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={h.status === 'Returned' ? 'success' : 'neutral'}>
                        {h.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {h.fine > 0 ? `₹${h.fine}` : '₹0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
