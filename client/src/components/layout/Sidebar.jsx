import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  History,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  X,
  Library,
  BookMarked,
  ReceiptIndianRupee
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isLibrarian, isMember } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-specific navigation items
  let navItems = [];

  if (isAdmin) {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Books Catalog', path: '/books', icon: BookOpen },
      { name: 'Add Book', path: '/books/add', icon: PlusCircle },
      { name: 'Members', path: '/members', icon: Users },
      { name: 'Librarians', path: '/librarians', icon: ShieldCheck },
      { name: 'Issue / Return', path: '/borrowings', icon: ArrowLeftRight },
      { name: 'Borrowing History', path: '/borrowings/history', icon: History },
      { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
      { name: 'Library Settings', path: '/settings', icon: Settings },
      { name: 'My Profile', path: '/profile', icon: UserCircle },
    ];
  } else if (isLibrarian) {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Books Catalog', path: '/books', icon: BookOpen },
      { name: 'Add Book', path: '/books/add', icon: PlusCircle },
      { name: 'Members', path: '/members', icon: Users },
      { name: 'Issue / Return', path: '/borrowings', icon: ArrowLeftRight },
      { name: 'Borrowing History', path: '/borrowings/history', icon: History },
      { name: 'Reports', path: '/reports', icon: BarChart3 },
      { name: 'My Profile', path: '/profile', icon: UserCircle },
    ];
  } else if (isMember) {
    navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Browse Books', path: '/books', icon: BookOpen },
      { name: 'My Borrowed Books', path: '/my-books', icon: BookMarked },
      { name: 'My Borrowing History', path: '/my-history', icon: History },
      { name: 'My Fines', path: '/my-fines', icon: ReceiptIndianRupee },
      { name: 'My Profile', path: '/profile', icon: UserCircle },
    ];
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Book<span className="text-brand-600">Vault</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 -mt-1">
                Library SaaS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                }
                alt={user?.name || 'User'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-700'
                      : isLibrarian
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
