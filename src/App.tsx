import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import SchoolsPage from './pages/schools/SchoolsPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

const isAuthenticated = () => !!localStorage.getItem('accessToken');

/** Redirects to /login if no token exists */
const PrivateRoute = ({ element }: { element: ReactElement }) =>
  isAuthenticated() ? element : <Navigate to="/login" replace />;

/** Redirects to /dashboard if a token already exists */
const PublicRoute = ({ element }: { element: ReactElement }) =>
  isAuthenticated() ? <Navigate to="/dashboard" replace /> : element;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root: redirect to dashboard or login */}
        <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />

        {/* Protected dashboard routes — all under /dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute
              element={
                <AdminLayout pageTitle="Dashboard" activePath="/dashboard">
                  <DashboardPage />
                </AdminLayout>
              }
            />
          }
        />
        <Route
          path="/dashboard/schools"
          element={
            <PrivateRoute
              element={
                <AdminLayout pageTitle="Schools" activePath="/dashboard/schools">
                  <SchoolsPage />
                </AdminLayout>
              }
            />
          }
        />

        {/* Public-only routes */}
        <Route path="/login"           element={<PublicRoute element={<LoginPage />} />} />
        <Route path="/signup"          element={<PublicRoute element={<SignupPage />} />} />
        <Route path="/forgot-password" element={<PublicRoute element={<ForgotPasswordPage />} />} />

        {/* Verify email — accessible regardless of auth state */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

