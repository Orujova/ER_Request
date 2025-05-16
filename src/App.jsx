import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { useIsAuthenticated } from "@azure/msal-react";
import { useEffect } from "react";

// Components
import Dashboard from "./Pages/Dashboard";
import RequestForm from "./Pages/RequestForm";
import RequestDetail from "./features/request/RequestDetail";
import ActionPage from "./Pages/ActionPage";
import AdminPanel from "./Pages/AdminPanel";
import RequestMatrix from "./Pages/RequestMatrix";
import Layout from "./components/layout/Layout";
import MainContainer from "./components/layout/MainContainer";
import Navbar from "./components/layout/Navbar";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import { AuthGuard, AdminGuard } from "./components/common/AuthGuard";
import ToastContainer from "./toast/ToastContainer";

// Import role utilities
import { ROLES, getDefaultRedirect, hasAccess } from "./utils/roles";
import {
  checkInitialAuthState,
  isAuthenticated as isJwtAuthenticated,
} from "./utils/authHandler";

// Auth redirect component
const AuthRedirect = ({ children, requireAuth = true }) => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!requireAuth && isAuthenticated && checkInitialAuthState()) {
      const redirectTo = getDefaultRedirect();
      console.log("AuthRedirect: Redirecting from login to:", redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [requireAuth, isAuthenticated, navigate]);

  if (requireAuth && !isAuthenticated && !checkInitialAuthState()) {
    console.log("AuthRedirect: Not authenticated, redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  // Global authentication status check
  useEffect(() => {
    if (
      location.pathname !== "/login" &&
      !isAuthenticated &&
      !checkInitialAuthState()
    ) {
      console.log("App: Redirecting to /login from:", location.pathname);
      navigate("/login", { state: { from: location }, replace: true });
    } else if (
      location.pathname === "/login" &&
      (isAuthenticated || checkInitialAuthState())
    ) {
      const redirectTo = getDefaultRedirect();
      console.log("App: Redirecting from /login to:", redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [location.pathname, isAuthenticated, navigate]);

  return (
    <Theme appearance="light" accentColor="blue" radius="medium">
      <Layout>
        <Navbar />
        <MainContainer>
          <ToastContainer />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <AuthRedirect requireAuth={false}>
                  <LoginPage />
                </AuthRedirect>
              }
              key="login"
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
              key="home"
            />

            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
              key="profile"
            />

            <Route
              path="/request/:id"
              element={
                <AuthGuard
                  requiredRoles={[ROLES.ADMIN, ROLES.ER_ADMIN, ROLES.ER_MEMBER]}
                >
                  <RequestDetail />
                </AuthGuard>
              }
              key="request-detail"
            />

            <Route
              path="/request/:id/action"
              element={
                <AuthGuard
                  requiredRoles={[ROLES.ADMIN, ROLES.ER_ADMIN, ROLES.ER_MEMBER]}
                >
                  <ActionPage />
                </AuthGuard>
              }
              key="request-action"
            />

            <Route
              path="/create-request"
              element={
                <AuthGuard>
                  <RequestForm />
                </AuthGuard>
              }
              key="create-request"
            />

            <Route
              path="/request-matrix"
              element={
                <AuthGuard
                  requiredRoles={[ROLES.ADMIN, ROLES.ER_ADMIN, ROLES.ER_MEMBER]}
                >
                  <RequestMatrix />
                </AuthGuard>
              }
              key="request-matrix"
            />

            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminPanel />
                </AdminGuard>
              }
              key="admin"
            />

            {/* Catch-all route */}
            <Route
              path="*"
              element={<Navigate to={getDefaultRedirect()} replace />}
              key="catch-all"
            />
          </Routes>
        </MainContainer>
      </Layout>
    </Theme>
  );
}

export default App;
