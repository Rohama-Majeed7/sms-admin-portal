import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import AdminDashboard from './pages/admin/AdminDashboard'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

const isAuthenticated = () => !!localStorage.getItem('accessToken');

/** Redirects to /login if no token exists */
const PrivateRoute = ({ element }: { element: ReactElement }) =>
  isAuthenticated() ? element : <Navigate to="/login" replace />;

/** Redirects to /dashboard if a token already exists (avoid login page when already in) */
const PublicRoute = ({ element }: { element: ReactElement }) =>
  isAuthenticated() ? <Navigate to="/dashboard" replace /> : element;

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root: redirect to dashboard or login */}
        <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} replace />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/admin/*" element={<PrivateRoute element={<AdminDashboard />} />} />

        {/* Public-only routes (bounce to dashboard if already logged in) */}
        <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
        <Route path="/signup" element={<PublicRoute element={<SignupPage />} />} />
        <Route path="/forgot-password" element={<PublicRoute element={<ForgotPasswordPage />} />} />

        {/* Verify email — accessible regardless of auth state */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App