import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BookOpen,
  CheckCircle2,
  BookmarkCheck,
  AlertTriangle,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ReceiptIndianRupee,
  PlusCircle,
  ArrowLeftRight,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Dashboard = () => {
  const { user, isAdmin, isLibrarian, isMember } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [memberStats, setMemberStats] = useState(null);
  const [myLoans, setMyLoans] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (isMember) {
          const [mStatsRes, myLoansRes, recBooksRes] = await Promise.all([
            api.get('/member/my-stats'),
            api.get('/member/my-borrowings'),
            api.get('/books?limit=4&availability=available')
          ]);
          setMemberStats(mStatsRes.data.data);
          setMyLoans(myLoansRes.data.data);
          setRecommendedBooks(recBooksRes.data.data.books);
        } else {
          const [statsRes, activityRes] = await Promise.all([
            api.get('/dashboard/stats'),
            api.get('/dashboard/activity')
          ]);
          setStats(statsRes.data.data);
          setActivities(activityRes.data.data);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isMember]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MEMBER DASHBOARD
  // -------------------------------------------------------------
  if (isMember) {
    return (
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-brand-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Member Self-Service Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-sm text-brand-100/90 leading-relaxed">
              Explore library resources, review your active book borrowings, monitor due dates, and explore curated reads.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/books')}
                className="px-4 py-2.5 rounded-xl bg-white text-brand-900 font-semibold text-xs hover:bg-brand-50 transition-colors shadow-sm"
              >
                Browse Books
              </button>
              <button
                onClick={() => navigate('/my-books')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md transition-colors border border-white/20"
              >
                My Borrowed Books
              </button>
            </div>
          </div>
        </div>

        {/* Member KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Currently Borrowed"
            value={memberStats?.currentlyBorrowed || 0}
            icon={BookOpen}
            color="indigo"
            subtitle="Active on your account"
          />
          <StatCard
            title="Due Soon"
            value={memberStats?.dueSoon || 0}
            icon={Clock}
            color="amber"
            subtitle="Within next 3 days"
          />
          <StatCard
            title="Overdue Books"
            value={memberStats?.overdue || 0}
            icon={AlertTriangle}
            color="rose"
            subtitle="Requires immediate return"
          />
          <StatCard
            title="Current Fines"
            value={`₹${memberStats?.currentFine || 0}`}
            icon={ReceiptIndianRupee}
            color={memberStats?.currentFine > 0 ? 'rose' : 'emerald'}
            subtitle={memberStats?.currentFine > 0 ? 'Outstanding balance' : 'Zero balance'}
          />
        </div>

        {/* Active Borrowings Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Currently Borrowed Books</h2>
              <p className="text-xs text-slate-500">Track return deadlines and fine statuses</p>
            </div>
            <button
              onClick={() => navigate('/my-books')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myLoans.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              You currently have no borrowed books. Check the catalog below to borrow something new!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myLoans.slice(0, 3).map((loan) => {
                const isOverdue = loan.isOverdue;
                return (
                  <div
                    key={loan._id}
                    className="flex gap-4 p-4 rounded-xl border border-slate-200/70 hover:border-brand-200 transition-all bg-slate-50/50"
                  >
                    <img
                      src={loan.book?.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=128&q=80'}
                      alt={loan.book?.title}
                      className="w-16 h-22 object-cover rounded-lg shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider block">
                        {loan.book?.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">
                        {loan.book?.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{loan.book?.author}</p>
                      
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                        {isOverdue ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            Overdue (+₹{loan.currentFine})
                          </span>
                        ) : (
                          <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            On Track
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recommended Books */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Featured & Available Books</h2>
              <p className="text-xs text-slate-500">Hand-picked selections from the central collection</p>
            </div>
            <button
              onClick={() => navigate('/books')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Browse all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendedBooks.map((book) => (
              <div
                key={book._id}
                onClick={() => navigate(`/books/${book._id}`)}
                className="cursor-pointer group rounded-xl border border-slate-200/60 p-3 hover:border-brand-300 hover:shadow-md transition-all bg-white"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-slate-100 mb-2.5">
                  <img
                    src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600">
                  {book.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5 group-hover:text-brand-600 transition-colors">
                  {book.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                    {book.availableCopies} available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN & LIBRARIAN DASHBOARD
  // -------------------------------------------------------------
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAdmin ? 'System & Library Executive Overview' : 'Librarian Operations Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time library analytics, member transactions, and inventory statistics.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/borrowings')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Issue / Return Book
          </button>
          <button
            onClick={() => navigate('/books/add')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            Add New Book
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Book Titles"
          value={stats?.totalBooks || 0}
          icon={BookOpen}
          color="indigo"
          subtitle={`${stats?.totalCopies || 0} total physical copies`}
        />
        <StatCard
          title="Available Copies"
          value={stats?.availableBooks || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Ready for checkout"
        />
        <StatCard
          title="Currently Issued"
          value={stats?.issuedBooks || 0}
          icon={BookmarkCheck}
          color="sky"
          subtitle="In circulation"
        />
        <StatCard
          title="Overdue Books"
          value={stats?.overdueBooks || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="Late returns pending"
        />

        {isAdmin ? (
          <>
            <StatCard
              title="Active Members"
              value={stats?.totalMembers || 0}
              icon={Users}
              color="purple"
              subtitle="Registered students & staff"
            />
            <StatCard
              title="Total Librarians"
              value={stats?.totalLibrarians || 0}
              icon={ShieldCheck}
              color="indigo"
              subtitle="Operational staff"
            />
            <StatCard
              title="Books Added This Month"
              value={stats?.booksAddedThisMonth || 0}
              icon={TrendingUp}
              color="emerald"
              subtitle="New inventory arrivals"
            />
            <StatCard
              title="Today's Issues"
              value={stats?.todayIssues || 0}
              icon={ArrowLeftRight}
              color="amber"
              subtitle={`${stats?.todayReturns || 0} returns processed today`}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Active Members"
              value={stats?.totalMembers || 0}
              icon={Users}
              color="purple"
              subtitle="Registered members"
            />
            <StatCard
              title="Today's Issues"
              value={stats?.todayIssues || 0}
              icon={ArrowLeftRight}
              color="amber"
              subtitle="Processed today"
            />
            <StatCard
              title="Today's Returns"
              value={stats?.todayReturns || 0}
              icon={CheckCircle2}
              color="emerald"
              subtitle="Checked back in today"
            />
          </>
        )}
      </div>

      {/* Analytics Charts Grid (Admin & Staff) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Borrowing Trend Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Borrowing Activity Trends</h3>
              <p className="text-xs text-slate-500">Daily checkout volume over time</p>
            </div>
            <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
              Last 7 Days
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  stats?.borrowingActivity && stats.borrowingActivity.length > 0
                    ? stats.borrowingActivity
                    : [
                        { _id: 'Day 1', borrowed: 2 },
                        { _id: 'Day 2', borrowed: 4 },
                        { _id: 'Day 3', borrowed: 1 },
                        { _id: 'Day 4', borrowed: 5 },
                        { _id: 'Day 5', borrowed: 3 },
                        { _id: 'Day 6', borrowed: 6 },
                        { _id: 'Day 7', borrowed: 4 }
                      ]
                }
              >
                <defs>
                  <linearGradient id="borrowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="borrowed"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#borrowGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Book Availability Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inventory Distribution</h3>
            <p className="text-xs text-slate-500">Live availability status of all library copies</p>
          </div>
          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.availabilityData || [
                    { name: 'Available', value: 80 },
                    { name: 'Issued', value: 15 },
                    { name: 'Overdue', value: 5 }
                  ]}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#f43f5e" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-around pt-3 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Issued
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Overdue
            </span>
          </div>
        </div>
      </div>

      {/* Categories & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Categories Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Books by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Total collection copies classified by subject</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoriesBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Recent Library Activity</h3>
          <p className="text-xs text-slate-500 mb-4">Latest transactions across the system</p>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto space-y-1">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      act.type === 'return'
                        ? 'bg-emerald-500 ring-4 ring-emerald-50'
                        : act.type === 'overdue'
                        ? 'bg-rose-500 ring-4 ring-rose-50'
                        : 'bg-brand-500 ring-4 ring-brand-50'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {act.description}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
