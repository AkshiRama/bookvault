import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  ArrowLeftRight,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ReceiptIndianRupee,
  RotateCcw
} from 'lucide-react';

export const BorrowingList = () => {
  const { success, error } = useToast();
  const [searchParams] = useSearchParams();

  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Issue Book Modal State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [membersList, setMembersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBook, setSelectedBook] = useState(searchParams.get('bookId') || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [issueLoading, setIssueLoading] = useState(false);

  // Return Book Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculatedFine, setCalculatedFine] = useState(0);
  const [overdueDays, setOverdueDays] = useState(0);
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchBorrowings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        bookId: searchParams.get('bookId') || undefined
      };
      const res = await api.get('/borrowings', { params });
      setBorrowings(res.data.data.borrowings);
      setTotal(res.data.data.total);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      error('Failed to load borrowing records');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, search, searchParams, error]);

  useEffect(() => {
    fetchBorrowings();
  }, [fetchBorrowings]);

  // Load members and books for Issue modal
  const openIssueModal = async () => {
    try {
      const [membersRes, booksRes] = await Promise.all([
        api.get('/members?limit=100&status=active'),
        api.get('/books?limit=100&availability=available')
      ]);
      setMembersList(membersRes.data.data.members);
      setBooksList(booksRes.data.data.books);

      // Default due date: +14 days
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDate(d.toISOString().split('T')[0]);

      setIssueModalOpen(true);
    } catch (err) {
      error('Failed to prepare issue form');
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember || !selectedBook) {
      error('Please select both a member and a book');
      return;
    }
    try {
      setIssueLoading(true);
      const res = await api.post('/borrowings/issue', {
        memberId: selectedMember,
        bookId: selectedBook,
        issueDate,
        dueDate
      });
      success(res.data.message || 'Book issued successfully');
      setIssueModalOpen(false);
      setSelectedMember('');
      setSelectedBook('');
      fetchBorrowings();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setIssueLoading(false);
    }
  };

  const openReturnModal = (record) => {
    setSelectedBorrowing(record);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    setReturnDate(todayStr);

    const due = new Date(record.dueDate);
    if (now > due) {
      const diff = Math.ceil(Math.abs(now - due) / (1000 * 60 * 60 * 24));
      setOverdueDays(diff);
      setCalculatedFine(diff * 10);
    } else {
      setOverdueDays(0);
      setCalculatedFine(0);
    }

    setReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBorrowing) return;
    try {
      setReturnLoading(true);
      const res = await api.put(`/borrowings/${selectedBorrowing._id}/return`, { returnDate });
      success(res.data.message || 'Book returned successfully');
      setReturnModalOpen(false);
      setSelectedBorrowing(null);
      fetchBorrowings();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Circulation: Issue & Return Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active book checkouts, automatic overdue penalties, and record returns.
          </p>
        </div>
        <button
          onClick={openIssueModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Issue Book
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by member name, membership ID, or book title..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none"
        >
          <option value="all">All Circulation Statuses</option>
          <option value="Issued">Currently Issued</option>
          <option value="Overdue">Overdue Books</option>
          <option value="Returned">Returned / Completed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : borrowings.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No circulation records found"
          description="There are currently no active or historical loans matching this view."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Book Title</th>
                  <th className="px-6 py-3.5">Issue Date</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Return Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Fine</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {borrowings.map((b) => {
                  const isOverdue = b.status === 'Overdue' || (!b.returnDate && new Date() > new Date(b.dueDate));
                  const isReturned = b.status === 'Returned';
                  return (
                    <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{b.member?.name}</p>
                        <p className="text-[11px] font-mono text-slate-400">{b.member?.membershipId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 truncate max-w-xs">{b.book?.title}</p>
                        <p className="text-[11px] font-mono text-slate-400">{b.book?.isbn}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {new Date(b.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {new Date(b.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            isReturned ? 'success' : isOverdue ? 'danger' : 'primary'
                          }
                        >
                          {isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {b.fine > 0 ? (
                          <span className="text-rose-600">₹{b.fine}</span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isReturned && (
                          <button
                            onClick={() => openReturnModal(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Issue Book Modal */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Issue Book to Member"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Select Member *
            </label>
            <select
              required
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose Active Member --</option>
              {membersList.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.membershipId}) - {m.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Select Book Title *
            </label>
            <select
              required
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose Available Book --</option>
              {booksList.map((bk) => (
                <option key={bk._id} value={bk._id}>
                  {bk.title} ({bk.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIssueModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={issueLoading}
              className="px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs disabled:opacity-50"
            >
              {issueLoading ? 'Processing...' : 'Confirm Checkout'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Book Modal with Live Fine Calculator */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Process Book Return"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5">
            <p className="font-bold text-slate-800 text-sm">{selectedBorrowing?.book?.title}</p>
            <p className="text-slate-500">Borrowed by: <strong>{selectedBorrowing?.member?.name}</strong></p>
            <p className="text-slate-500">
              Due Date: <strong>{selectedBorrowing?.dueDate ? new Date(selectedBorrowing.dueDate).toLocaleDateString() : ''}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Return Date
            </label>
            <input
              type="date"
              required
              value={returnDate}
              onChange={(e) => {
                setReturnDate(e.target.value);
                const ret = new Date(e.target.value);
                const due = new Date(selectedBorrowing.dueDate);
                if (ret > due) {
                  const diff = Math.ceil(Math.abs(ret - due) / (1000 * 60 * 60 * 24));
                  setOverdueDays(diff);
                  setCalculatedFine(diff * 10);
                } else {
                  setOverdueDays(0);
                  setCalculatedFine(0);
                }
              }}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none"
            />
          </div>

          {/* Overdue / Fine Alert */}
          {overdueDays > 0 ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Overdue by {overdueDays} day(s)</span>
              </div>
              <p>Calculated fine at ₹10/day: <strong className="text-rose-900 text-sm">₹{calculatedFine}</strong></p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Returned on or before due date. Fine: ₹0.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReturnModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={returnLoading}
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-50"
            >
              {returnLoading ? 'Processing...' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
