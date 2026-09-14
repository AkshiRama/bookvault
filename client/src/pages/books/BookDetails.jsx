import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Building,
  Languages,
  FileText,
  Copy,
  CheckCircle,
  AlertCircle,
  Edit2,
  ArrowLeftRight
} from 'lucide-react';

export const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [book, setBook] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/books/${id}`);
        setBook(res.data.data.book);
        setBorrowings(res.data.data.borrowings || []);
      } catch (err) {
        console.error('Failed to fetch book:', err);
        error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, error]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="h-80 bg-white rounded-3xl border border-slate-200 p-8" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Book not found.</p>
        <button
          onClick={() => navigate('/books')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/books')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Books Catalog
      </button>

      {/* Main Dossier Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Cover */}
          <div className="w-full md:w-64 shrink-0 flex flex-col items-center">
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-lg bg-slate-100 border border-slate-200">
              <img
                src={
                  book.coverUrl ||
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
                }
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 w-full">
              {isAvailable ? (
                <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-center font-bold text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  {book.availableCopies} of {book.quantity} Available
                </div>
              ) : (
                <div className="w-full py-2.5 px-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/60 text-center font-bold text-xs flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  All Copies Currently Issued
                </div>
              )}
            </div>
          </div>

          {/* Book Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <Badge variant="primary" className="text-xs uppercase tracking-wider">
                {book.category}
              </Badge>
              {isStaff && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/books/${book._id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Book
                  </button>
                  <button
                    onClick={() => navigate(`/borrowings?bookId=${book._id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Issue This Book
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {book.title}
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1">by {book.author}</p>

            {/* Quick Fact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  ISBN
                </span>
                <span className="font-mono font-semibold text-slate-800">{book.isbn}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Published
                </span>
                <span className="font-semibold text-slate-800">{book.publishedYear}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Language
                </span>
                <span className="font-semibold text-slate-800">{book.language}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  Pages
                </span>
                <span className="font-semibold text-slate-800">{book.pages} pages</span>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Synopsis / Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {book.description || 'No description available for this catalog entry.'}
              </p>
            </div>

            {/* Publisher */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Published by <strong className="text-slate-700">{book.publisher}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Borrowing History for this book */}
      {isStaff && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900 mb-1">Circulation & Borrowing History</h3>
          <p className="text-xs text-slate-500 mb-4">
            Recent member borrowings associated with this specific title
          </p>

          {borrowings.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No borrowing records found for this book yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Member</th>
                    <th className="px-4 py-2.5">Membership ID</th>
                    <th className="px-4 py-2.5">Issue Date</th>
                    <th className="px-4 py-2.5">Due Date</th>
                    <th className="px-4 py-2.5">Return Date</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {borrowings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-800">{b.member?.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{b.member?.membershipId}</td>
                      <td className="px-4 py-3">{new Date(b.issueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{new Date(b.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            b.status === 'Returned'
                              ? 'success'
                              : b.status === 'Overdue'
                              ? 'danger'
                              : 'primary'
                          }
                        >
                          {b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
