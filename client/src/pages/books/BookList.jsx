import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Layers,
  LayoutGrid,
  List,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from 'lucide-react';

const CATEGORIES = ['All', 'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Education', 'Other'];

export const BookList = () => {
  const { isStaff, isAdmin, isMember } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState('all'); // 'all' | 'available' | 'unavailable'
  const [sort, setSort] = useState('createdAt_desc');

  // Deletion modal
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        availability: availability !== 'all' ? availability : undefined,
        sort: sort !== 'createdAt_desc' ? sort : undefined,
      };

      const res = await api.get('/books', { params });
      setBooks(res.data.data.books);
      setTotal(res.data.data.total);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      error('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, availability, sort, error]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/books/${bookToDelete._id}`);
      success(res.data.message || 'Book deleted successfully');
      setBookToDelete(null);
      fetchBooks();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete book');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isMember ? 'Library Book Catalog' : 'Book Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, and manage all books and circulating materials.
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => navigate('/books/add')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Live Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Title, Author, or ISBN..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none transition-all"
            />
          </form>

          {/* Availability Filter */}
          <select
            value={availability}
            onChange={(e) => {
              setAvailability(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available Now</option>
            <option value="unavailable">Fully Checked Out</option>
          </select>

          {/* Sorting */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="createdAt_desc">Recently Added</option>
            <option value="title_asc">Title (A - Z)</option>
            <option value="title_desc">Title (Z - A)</option>
            <option value="author_asc">Author (A - Z)</option>
            <option value="copies_desc">Most Copies Available</option>
            <option value="year_desc">Publication Year (Newest)</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider pr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                category === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <TableSkeleton rows={8} cols={6} />
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          title="No books found"
          description="Try adjusting your search terms or clearing your category filters."
          action={
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setAvailability('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Reset Filters
            </button>
          }
        />
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Book Details</th>
                  <th className="px-6 py-3.5">ISBN</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Publisher / Year</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  return (
                    <tr key={book._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              book.coverUrl ||
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded shadow-xs shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p
                              onClick={() => navigate(`/books/${book._id}`)}
                              className="font-bold text-slate-900 truncate hover:text-brand-600 cursor-pointer"
                            >
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{book.isbn}</td>
                      <td className="px-6 py-4">
                        <Badge variant="primary">{book.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p className="truncate max-w-[140px]">{book.publisher}</p>
                        <p className="text-[11px] text-slate-400">{book.publishedYear}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{book.availableCopies}</span>
                        <span className="text-slate-400"> / {book.quantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        {isAvailable ? (
                          <Badge variant="success">Available</Badge>
                        ) : (
                          <Badge variant="danger">Checked Out</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/books/${book._id}`)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Book"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isStaff && (
                            <button
                              onClick={() => navigate(`/books/${book._id}/edit`)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Book"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => setBookToDelete(book)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Delete Book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
      ) : (
        // Grid View
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {books.map((book) => (
              <div
                key={book._id}
                className="group bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 mb-3 relative">
                    <img
                      src={
                        book.coverUrl ||
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      {book.availableCopies > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                          {book.availableCopies} Left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-xs">
                          Out
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="primary" className="mb-1 text-[10px]">
                    {book.category}
                  </Badge>
                  <h3
                    onClick={() => navigate(`/books/${book._id}`)}
                    className="text-xs font-bold text-slate-900 truncate hover:text-brand-600 cursor-pointer"
                  >
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/books/${book._id}`)}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Details
                  </button>
                  {isStaff && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/books/${book._id}/edit`)}
                        className="p-1 text-slate-400 hover:text-amber-600 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setBookToDelete(book)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleDeleteBook}
        isLoading={deleteLoading}
        title="Delete Book"
        message={`Are you sure you want to permanently delete "${bookToDelete?.title}"? If any active borrowing records exist, the operation will be aborted to prevent data inconsistency.`}
      />
    </div>
  );
};
