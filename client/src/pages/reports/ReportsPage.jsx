import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  BarChart3,
  Download,
  Printer,
  BookOpen,
  Users,
  AlertTriangle,
  PieChart as PieIcon,
  TrendingUp,
  ReceiptIndianRupee
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const ReportsPage = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('popular-books'); // 'popular-books' | 'popular-members' | 'overdue' | 'categories' | 'monthly'
  const [popularBooks, setPopularBooks] = useState([]);
  const [popularMembers, setPopularMembers] = useState([]);
  const [overdueReport, setOverdueReport] = useState([]);
  const [categoryReport, setCategoryReport] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        const [pb, pm, od, cat, mon, sum] = await Promise.all([
          api.get('/reports/popular-books'),
          api.get('/reports/popular-members'),
          api.get('/reports/overdue'),
          api.get('/reports/categories'),
          api.get('/reports/monthly'),
          api.get('/reports/summary')
        ]);
        setPopularBooks(pb.data.data);
        setPopularMembers(pm.data.data);
        setOverdueReport(od.data.data);
        setCategoryReport(cat.data.data);
        setMonthlyStats(mon.data.data);
        setSummary(sum.data.data);
      } catch (err) {
        error('Failed to load report analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAllReports();
  }, [error]);

  const handleExportCSV = () => {
    let rows = [];
    let filename = 'bookvault-report.csv';

    if (activeTab === 'popular-books') {
      rows.push(['Title', 'Author', 'Category', 'ISBN', 'Borrow Count', 'Available Copies']);
      popularBooks.forEach(b => rows.push([b.title, b.author, b.category, b.isbn, b.borrowCount, b.availableCopies]));
      filename = 'popular-books-report.csv';
    } else if (activeTab === 'popular-members') {
      rows.push(['Member Name', 'Email', 'Membership ID', 'Borrow Count']);
      popularMembers.forEach(m => rows.push([m.name, m.email, m.membershipId, m.borrowCount]));
      filename = 'active-members-report.csv';
    } else if (activeTab === 'overdue') {
      rows.push(['Member Name', 'Book Title', 'Issue Date', 'Due Date', 'Days Overdue', 'Fine']);
      overdueReport.forEach(o => rows.push([o.member?.name, o.book?.title, o.issueDate, o.dueDate, o.daysOverdue, o.fine]));
      filename = 'overdue-books-report.csv';
    } else if (activeTab === 'categories') {
      rows.push(['Category', 'Titles', 'Total Copies', 'Available Copies', 'Issued Copies']);
      categoryReport.forEach(c => rows.push([c.category, c.titles, c.totalCopies, c.availableCopies, c.issuedCopies]));
      filename = 'category-distribution-report.csv';
    } else if (activeTab === 'monthly') {
      rows.push(['Month', 'Issued', 'Returned', 'Total Fines']);
      monthlyStats.forEach(m => rows.push([m._id, m.issued, m.returned, m.totalFines]));
      filename = 'monthly-circulation-report.csv';
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`Exported ${filename} successfully`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Compiling library reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Insights</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Examine circulation trends, overdue fines, and export audit records to CSV or print view.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Summary KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Books</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary?.totalBooks || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Members</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary?.totalMembers || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">All-Time Loans</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{summary?.totalBorrowings || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed Returns</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{summary?.totalReturns || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Overdue</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{summary?.totalOverdue || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Fines</p>
          <p className="text-xl font-bold text-slate-900 mt-1">₹{summary?.totalFines || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar no-print">
        {[
          { id: 'popular-books', label: 'Most Borrowed Books', icon: BookOpen },
          { id: 'popular-members', label: 'Most Active Members', icon: Users },
          { id: 'overdue', label: 'Overdue Books Analysis', icon: AlertTriangle },
          { id: 'categories', label: 'Category Breakdown', icon: PieIcon },
          { id: 'monthly', label: 'Monthly Trends', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'popular-books' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularBooks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="title" stroke="#94a3b8" fontSize={10} tickFormatter={(t) => t.substring(0, 15) + '...'} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="borrowCount" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Checkouts" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Title</th>
                  <th className="px-4 py-2.5">Author</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">ISBN</th>
                  <th className="px-4 py-2.5">Borrow Count</th>
                  <th className="px-4 py-2.5">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {popularBooks.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">{b.title}</td>
                    <td className="px-4 py-3 text-slate-600">{b.author}</td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{b.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{b.isbn}</td>
                    <td className="px-4 py-3 font-bold text-brand-600">{b.borrowCount} checkouts</td>
                    <td className="px-4 py-3 text-slate-700">{b.availableCopies} available</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'popular-members' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Member Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Membership ID</th>
                <th className="px-4 py-2.5">Total Loans Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularMembers.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600">{m.email}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{m.membershipId}</td>
                  <td className="px-4 py-3 font-bold text-brand-600">{m.borrowCount} books</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'overdue' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Member</th>
                <th className="px-4 py-2.5">Book Title</th>
                <th className="px-4 py-2.5">Issue Date</th>
                <th className="px-4 py-2.5">Due Date</th>
                <th className="px-4 py-2.5">Days Late</th>
                <th className="px-4 py-2.5">Assessed Fine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overdueReport.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">{o.member?.name}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{o.book?.title}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(o.issueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(o.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-bold text-rose-600">{o.daysOverdue} days</td>
                  <td className="px-4 py-3 font-bold text-rose-600">₹{o.fine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Unique Titles</th>
                <th className="px-4 py-2.5">Total Physical Copies</th>
                <th className="px-4 py-2.5">Available Copies</th>
                <th className="px-4 py-2.5">Currently Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryReport.map((c) => (
                <tr key={c.category} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">{c.category}</td>
                  <td className="px-4 py-3 text-slate-600">{c.titles}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{c.totalCopies}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">{c.availableCopies}</td>
                  <td className="px-4 py-3 text-slate-600">{c.issuedCopies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="issued" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.2} name="Issued" />
                <Area type="monotone" dataKey="returned" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Returned" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-2.5">Month</th>
                <th className="px-4 py-2.5">Issued Copies</th>
                <th className="px-4 py-2.5">Returned Copies</th>
                <th className="px-4 py-2.5">Fines Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyStats.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">{m._id}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{m.issued}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{m.returned}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">₹{m.totalFines}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
