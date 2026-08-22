import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Loader } from '../components/ui/Loader';
import { useAssessmentContext } from '../context/AssessmentContext';

const Landing = lazy(() => import('../pages/Landing/Landing'));
const Login = lazy(() => import('../pages/Login/Login'));
const OTP = lazy(() => import('../pages/OTP/OTP'));
const AssessmentConfig = lazy(() => import('../pages/Assessment/AssessmentConfig'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const TermsAndConditions = lazy(() => import('../pages/Terms/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('../pages/Privacy/PrivacyPolicy'));

const LAST_ROUTE_KEY = 'spark_last_route';
// Routes that should never be saved as "last route" (public/auth routes)
const PUBLIC_ROUTES = ['/', '/login', '/otp', '/terms', '/privacy'];

/**
 * Tracks the current location and saves it to localStorage so that
 * after a refresh the user is restored to the same protected page.
 */
const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    if (!PUBLIC_ROUTES.includes(location.pathname)) {
      localStorage.setItem(LAST_ROUTE_KEY, location.pathname);
    }
  }, [location.pathname]);
  return null;
};

/**
 * Guards the /otp and /setup routes (requires OTP verification).
 */
const ProtectedRoute = ({ children, check }) => {
  return check ? children : <Navigate to="/login" replace />;
};

/**
 * Guards /dashboard — requires both OTP verification and profile setup.
 * On failure, redirects to the appropriate recovery route.
 */
const DashboardRoute = ({ children, checkOtp, checkSetup }) => {
  if (!checkOtp) return <Navigate to="/login" replace />;
  if (!checkSetup) return <Navigate to="/setup" replace />;
  return children;
};

/**
 * The root redirect: decides where to send users who hit "/" based on
 * their persisted session state, including last visited route.
 */
const RootRedirect = ({ isOtpVerified, hasSetup }) => {
  if (!isOtpVerified) return <Navigate to="/login" replace />;
  if (!hasSetup) return <Navigate to="/setup" replace />;

  // Restore last visited protected route if available
  const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
  if (lastRoute && !PUBLIC_ROUTES.includes(lastRoute)) {
    return <Navigate to={lastRoute} replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export const AppRoutes = () => {
  const { isOtpVerified, hasSetup } = useAssessmentContext();

  return (
    <BrowserRouter>
      <RouteTracker />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Root: smart redirect based on session */}
          <Route
            path="/"
            element={<RootRedirect isOtpVerified={isOtpVerified} hasSetup={hasSetup} />}
          />

          {/* Public auth routes — redirect away if already authenticated */}
          <Route
            path="/login"
            element={
              isOtpVerified
                ? <Navigate to={hasSetup ? "/dashboard" : "/setup"} replace />
                : <Login />
            }
          />
          <Route
            path="/otp"
            element={
              isOtpVerified
                ? <Navigate to={hasSetup ? "/dashboard" : "/setup"} replace />
                : <OTP />
            }
          />

          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Protected: requires OTP verification */}
          <Route
            path="/setup"
            element={
              <ProtectedRoute check={isOtpVerified}>
                <AssessmentConfig />
              </ProtectedRoute>
            }
          />

          {/* Protected: requires OTP + profile setup */}
          <Route
            path="/dashboard"
            element={
              <DashboardRoute checkOtp={isOtpVerified} checkSetup={hasSetup}>
                <Dashboard />
              </DashboardRoute>
            }
          />

          {/* Fallback: unknown routes → smart redirect */}
          <Route
            path="*"
            element={<RootRedirect isOtpVerified={isOtpVerified} hasSetup={hasSetup} />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
