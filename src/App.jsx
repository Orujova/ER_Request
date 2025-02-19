// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import Dashboard from "./Pages/Dashboard";
// import RequestForm from "./Pages/RequestForm";
// import RequestDetail from "./features/request/RequestDetail";
// import AdminPanel from "./Pages/AdminPanel";
// import RequestMatrix from "./Pages/RequestMatrix";
// import FilterSection from "./components/FilterSection";

import Layout from "./components/layout/Layout";
import MainContainer from "./components/layout/MainContainer";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import NavHeader from "./components/layout/Navbar.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import ProfilePage from "./Pages/ProfilePage";
import { AuthGuard } from "./components/common/AuthGuard";

function App() {
  return (
    <Theme appearance="light" accentColor="blue" radius="medium">
      <Layout>
        <NavHeader />
        <MainContainer>
          <Routes>
            {/* Login Page - Public */}
            <Route
              path="/login"
              element={
                <AuthenticatedTemplate>
                  <Navigate to="/" replace />
                </AuthenticatedTemplate>
              }
            />
            <Route
              path="/login"
              element={
                <UnauthenticatedTemplate>
                  <LoginPage />
                </UnauthenticatedTemplate>
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

            {/* Add other protected routes here when ready */}
            {/*
            <Route
              path="/request/:id"
              element={
                <AuthGuard>
                  <RequestDetail />
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
            */}

            {/* Catch-all routes */}
            <Route
              path="*"
              element={
                <AuthenticatedTemplate>
                  <Navigate to="/" replace />
                </AuthenticatedTemplate>
              }
            />
            <Route
              path="*"
              element={
                <UnauthenticatedTemplate>
                  <Navigate to="/login" replace />
                </UnauthenticatedTemplate>
              }
            />
          </Routes>
        </MainContainer>
      </Layout>
    </Theme>
  );
}

export default App;
