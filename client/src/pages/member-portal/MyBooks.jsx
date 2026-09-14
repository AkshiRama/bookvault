import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { BookMarked, Clock, AlertTriangle } from 'lucide-react';

export const MyBooks = () => {
  const { error } = useToast();
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyLoans = async () => {
      try {
        setLoading(true);
        const res = await api.get('/member/my-borrowings');
        setBorrowings(res.data.data);
      } catch (err) {
        error('Failed to load your borrowed books');
      } finally {
        setLoading(false);
      }
    };
    fetchMyLoans();
  }, [error]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your books...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Borrowed Books</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Currently checked out materials under your library card.
        </p>
      </div>

      {borrowings.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No books currently borrowed"
          description="You don't have any active checkouts right now. Explore the catalog to discover new reads."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {borrowings.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex gap-4">
                <img
                  src={
                    item.book?.coverUrl ||
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={item.book?.title}
                  className="w-20 h-28 object-cover rounded-xl shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <Badge variant="primary" className="text-[10px] mb-1">
                    {item.book?.category}
                  </Badge>
                  <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {item.book?.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{item.book?.author}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">ISBN: {item.book?.isbn}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Issue Date:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(item.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Due Date:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2">
                  {item.isOverdue ? (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Overdue ({item.daysOverdue} days)
                      </span>
                      <span className="font-bold text-rose-900">+₹{item.currentFine} fine</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Active Checkout (On Track)
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
