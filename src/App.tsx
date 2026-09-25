import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import SchoolOnboardingPage from "./pages/onboarding/SchoolOnboardingPage";
import SchoolSettingsPage from "./pages/settings/SchoolSettingsPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import { ToastContainer } from "react-toastify";

const isAuthenticated = () => !!localStorage.getItem("accessToken");
const isAdmin = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).role === "ADMIN" : false;
};
/**
 * Route guard for routes requiring an authenticated admin with an ACTIVE school.
 * If not authenticated -> redirect to /login.
 * If authenticated without active school -> redirect to /onboarding.
 */
const hasActiveSchool = () => {
  const user = localStorage.getItem("user");
  const schoolStatus = user ? JSON.parse(user).schoolAdmin?.status : null;
  if (schoolStatus === "PENDING") {
    return false;
  }
  if (schoolStatus === "INACTIVE") {
    return false;
  }
  return schoolStatus;
};

const ActiveSchoolRoute = ({ element }: { element: ReactElement }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  if (!hasActiveSchool()) {
    return <Navigate to="/onboarding" replace />;
  }
  return element;
};

/**
 * Route guard for onboarding screen.
 * If not authenticated -> redirect to /login.
 * If authenticated and already has an active school -> redirect to /dashboard.
 */
const OnboardingRoute = ({ element }: { element: ReactElement }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
  if (hasActiveSchool()) {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
};

/**
 * Redirects authenticated users away from public auth pages.
 * Routes to /dashboard if school is active, or /onboarding if not.
 */
const PublicRoute = ({ element }: { element: ReactElement }) => {
  if (!isAuthenticated()) {
    return element;
  }
  return (
    <Navigate to={hasActiveSchool() ? "/dashboard" : "/onboarding"} replace />
  );
};

const App = () => {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          {/* Root: redirect based on auth and school status */}
          <Route
            path="/"
            element={
              <Navigate
                to={
                  isAuthenticated()
                    ? hasActiveSchool()
                      ? "/dashboard"
                      : "/onboarding"
                    : "/login"
                }
                replace
              />
            }
          />

          {/* School Onboarding Screen */}
          <Route
            path="/onboarding"
            element={<OnboardingRoute element={<SchoolOnboardingPage />} />}
          />

          {/* Protected dashboard route — requires active school */}
          <Route
            path="/dashboard"
            element={
              <ActiveSchoolRoute
                element={
                  <AdminLayout pageTitle="Dashboard" activePath="/dashboard">
                    <DashboardPage />
                  </AdminLayout>
                }
              />
            }
          />

          {/* Protected School Settings route — requires active school */}
          <Route
            path="/settings"
            element={
              <ActiveSchoolRoute
                element={
                  <AdminLayout
                    pageTitle="School Settings"
                    activePath="/settings"
                  >
                    <SchoolSettingsPage />
                  </AdminLayout>
                }
              />
            }
          />

          {/* Redirect /dashboard/settings to /settings */}
          <Route
            path="/dashboard/settings"
            element={<Navigate to="/settings" replace />}
          />

          {/* Redirect /dashboard/schools to /dashboard (multi-school management removed) */}
          <Route
            path="/dashboard/schools"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Public-only routes */}
          <Route
            path="/login"
            element={<PublicRoute element={<LoginPage />} />}
          />
          <Route
            path="/signup"
            element={<PublicRoute element={<SignupPage />} />}
          />
          <Route
            path="/forgot-password"
            element={<PublicRoute element={<ForgotPasswordPage />} />}
          />

          {/* Verify email — accessible regardless of auth state */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated()
                    ? hasActiveSchool()
                      ? "/dashboard"
                      : "/onboarding"
                    : "/login"
                }
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
