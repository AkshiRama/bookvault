import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  ArrowLeft,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Clock,
  AlertTriangle,
  ReceiptIndianRupee
} from 'lucide-react';

export const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isStaff } = useAuth();
  const { error } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/members/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load member dossier:', err);
        error('Failed to load member profile details');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id, error]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading member profile...</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Member not found.
        <button onClick={() => navigate('/members')} className="block mx-auto mt-2 text-brand-600 underline">
          Back to list
        </button>
      </div>
    );
  }

  const { member, activeBorrowings, borrowingHistory, stats } = data;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/members')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Member Directory
      </button>

      {/* Member Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{member.name}</h1>
                <Badge variant={member.status === 'active' ? 'success' : 'danger'}>
                  {member.status}
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">ID: {member.membershipId}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              {member.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              {member.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Joined {new Date(member.joinedAt || member.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-indigo-50/60 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Currently Borrowed</p>
            <p className="text-xl font-bold text-indigo-900 mt-1">{stats.activeCount} Books</p>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Overdue Books</p>
            <p className="text-xl font-bold text-amber-900 mt-1">{stats.overdueCount}</p>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Past Returned</p>
            <p className="text-xl font-bold text-emerald-900 mt-1">{stats.totalHistoryCount}</p>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Total Fines Accrued</p>
            <p className="text-xl font-bold text-rose-900 mt-1">₹{stats.totalFines}</p>
          </div>
        </div>
      </div>

      {/* Currently Borrowed Books Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Active Loans</h3>
        <p className="text-xs text-slate-500 mb-4">Books currently checked out by this member</p>

        {activeBorrowings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No active book loans at this time.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Book</th>
                  <th className="px-4 py-2.5">ISBN</th>
                  <th className="px-4 py-2.5">Issue Date</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeBorrowings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{b.book?.title}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{b.book?.isbn}</td>
                    <td className="px-4 py-3">{new Date(b.issueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={new Date() > new Date(b.dueDate) ? 'danger' : 'primary'}>
                        {new Date() > new Date(b.dueDate) ? 'Overdue' : 'Issued'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Borrowing Record */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Borrowing History</h3>
        <p className="text-xs text-slate-500 mb-4">Completed past returns and recorded fines</p>

        {borrowingHistory.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No past returned loans recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Book Title</th>
                  <th className="px-4 py-2.5">Issue Date</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5">Return Date</th>
                  <th className="px-4 py-2.5">Fine Assessed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {borrowingHistory.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{b.book?.title}</td>
                    <td className="px-4 py-3">{new Date(b.issueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(b.returnDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {b.fine > 0 ? `₹${b.fine}` : '₹0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
