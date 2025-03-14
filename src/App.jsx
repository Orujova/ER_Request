// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { useIsAuthenticated } from "@azure/msal-react";

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
import { AuthGuard } from "./components/common/AuthGuard";
import ToastContainer from "./toast/ToastContainer";
// Auth redirect component
const AuthRedirect = ({ children, requireAuth = true }) => {
  const isAuthenticated = useIsAuthenticated();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
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
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />

            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />

            <Route
              path="/request/:id"
              element={
                <AuthGuard>
                  <RequestDetail />
                </AuthGuard>
              }
            />
            <Route
              path="/request/:id/action"
              element={
                <AuthGuard>
                  <ActionPage />
                </AuthGuard>
              }
            />

            <Route
              path="/create-request"
              element={
                <AuthGuard>
                  <RequestForm />
                </AuthGuard>
              }
            />

            <Route
              path="/request-matrix"
              element={
                <AuthGuard>
                  <RequestMatrix />
                </AuthGuard>
              }
            />

            <Route
              path="/admin"
              element={
                <AuthGuard>
                  <AdminPanel />
                </AuthGuard>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContainer>
      </Layout>
    </Theme>
  );
}

export default App;
