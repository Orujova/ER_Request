// src/Pages/LoginPage.jsx

import { useIsAuthenticated } from "@azure/msal-react";
import { Navigate } from "react-router-dom";
import { SignInButton } from "../components/common/SignInButton";

const LoginPage = () => {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to ER Request
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in with your organizational account
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center">
            <SignInButton className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" />

            <div className="mt-8 text-sm">
              <p className="text-gray-600">
                By signing in, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
