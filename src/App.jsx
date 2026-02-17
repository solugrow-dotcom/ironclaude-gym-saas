import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth
import LoginPage    from './pages/auth/LoginPage';
import SignupPage   from './pages/auth/SignupPage';
import SetupGymPage from './pages/SetupGymPage';

// Dashboard
import DashboardPage      from './pages/dashboard/DashboardPage';
import MembersPage        from './pages/dashboard/MembersPage';
import TrainersPage       from './pages/dashboard/TrainersPage';
import PlansPage          from './pages/dashboard/PlansPage';
import SubscriptionsPage  from './pages/dashboard/SubscriptionsPage';
import PaymentsPage       from './pages/dashboard/PaymentsPage';
import AttendancePage     from './pages/dashboard/AttendancePage';

// Admin
import AdminGymsPage    from './pages/admin/AdminGymsPage';
import AdminUsersPage   from './pages/admin/AdminUsersPage';
import AdminRevenuePage from './pages/admin/AdminRevenuePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth/login"  element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />

          {/* Semi-protected: requires auth, used after signup */}
          <Route path="/setup-gym" element={
            <ProtectedRoute>
              <SetupGymPage />
            </ProtectedRoute>
          } />

          {/* Dashboard routes — gym_owner, staff, admin */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['gym_owner', 'staff', 'admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index               element={<DashboardPage />} />
            <Route path="members"      element={<MembersPage />} />
            <Route path="trainers"     element={
              <ProtectedRoute roles={['gym_owner', 'admin']}>
                <TrainersPage />
              </ProtectedRoute>
            } />
            <Route path="plans"        element={
              <ProtectedRoute roles={['gym_owner', 'admin']}>
                <PlansPage />
              </ProtectedRoute>
            } />
            <Route path="subscriptions" element={
              <ProtectedRoute roles={['gym_owner', 'admin']}>
                <SubscriptionsPage />
              </ProtectedRoute>
            } />
            <Route path="payments"     element={
              <ProtectedRoute roles={['gym_owner', 'admin']}>
                <PaymentsPage />
              </ProtectedRoute>
            } />
            <Route path="attendance"   element={<AttendancePage />} />
          </Route>

          {/* Admin-only routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index          element={<Navigate to="/admin/gyms" replace />} />
            <Route path="gyms"    element={<AdminGymsPage />} />
            <Route path="users"   element={<AdminUsersPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
          </Route>

          {/* Default redirects */}
          <Route path="/"   element={<Navigate to="/dashboard" replace />} />
          <Route path="*"   element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '80px', color: 'var(--border)', letterSpacing: '0.1em' }}>404</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)' }}>PAGE NOT FOUND</div>
      <a href="/dashboard" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--acid)', textDecoration: 'underline' }}>← Return to Dashboard</a>
    </div>
  );
}
