import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleGuard } from './routes/RoleGuard';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { BookList } from './pages/books/BookList';
import { BookDetails } from './pages/books/BookDetails';
import { AddEditBook } from './pages/books/AddEditBook';
import { MemberList } from './pages/members/MemberList';
import { MemberDetails } from './pages/members/MemberDetails';
import { LibrarianList } from './pages/librarians/LibrarianList';
import { BorrowingList } from './pages/borrowings/BorrowingList';
import { MyBooks } from './pages/member-portal/MyBooks';
import { MyHistory } from './pages/member-portal/MyHistory';
import { MyFines } from './pages/member-portal/MyFines';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AccessDenied } from './routes/AccessDenied';

export const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected SaaS Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Books */}
              <Route path="books" element={<BookList />} />
              <Route path="books/:id" element={<BookDetails />} />
              <Route
                path="books/add"
                element={
                  <RoleGuard allowedRoles={['admin', 'librarian']}>
                    <AddEditBook />
                  </RoleGuard>
                }
              />
              <Route
                path="books/:id/edit"
                element={
                  <RoleGuard allowedRoles={['admin', 'librarian']}>
                    <AddEditBook />
                  </RoleGuard>
                }
              />

              {/* Members */}
              <Route
                path="members"
                element={
                  <RoleGuard allowedRoles={['admin', 'librarian']}>
                    <MemberList />
                  </RoleGuard>
                }
              />
              <Route path="members/:id" element={<MemberDetails />} />

              {/* Librarians (Admin Only) */}
              <Route
                path="librarians"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <LibrarianList />
                  </RoleGuard>
                }
              />

              {/* Borrowings / Circulation */}
              <Route
                path="borrowings"
                element={
                  <RoleGuard allowedRoles={['admin', 'librarian']}>
                    <BorrowingList />
                  </RoleGuard>
                }
              />
              <Route
                path="borrowings/history"
                element={
                  <RoleGuard allowedRoles={['admin', 'librarian']}>
                    <BorrowingList />
                  </RoleGuard>
                }
              />

              {/* Member Self-Service Portal */}
              <Route
                path="my-books"
                element={
                  <RoleGuard allowedRoles={['member']}>
                    <MyBooks />
                  </RoleGuard>
                }
              />
              <Route
                path="my-history"
                element={
                  <RoleGuard allowedRoles={['member']}>
                    <MyHistory />
                  </RoleGuard>
                }
              />
              <Route
                path="my-fines"
                element={
                  <RoleGuard allowedRoles={['member']}>
                    <MyFines />
                  </RoleGuard>
                }
              />

              {/* Reports (Admin & Librarian) */}
              <Route
                path="reports"
                element={
                  <RoleGuard allowedRoles={['admin', 'librarian']}>
                    <ReportsPage />
                  </RoleGuard>
                }
              />

              {/* Settings (Admin Only) */}
              <Route
                path="settings"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <SettingsPage />
                  </RoleGuard>
                }
              />

              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />

              {/* 403 Forbidden Access Denied */}
              <Route path="access-denied" element={<AccessDenied />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};
