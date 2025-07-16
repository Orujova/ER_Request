import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginRequest } from "../../authConfig";
import { HomeIcon } from "lucide-react";
import { useState } from "react";
import { getDefaultRedirect } from "../utils/roles";

const LoginPage = () => {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const from = location.state?.from?.pathname || getDefaultRedirect() || "/";

  const handleSignIn = async () => {
    if (inProgress !== "none" || isLoading) return;

    setIsLoading(true);
    setLoginError(null);

    try {
      await instance.loginRedirect({
        ...loginRequest,
        state: JSON.stringify({ returnUrl: from }),
      });
    } catch (error) {
      console.error("Login redirect failed:", error);
      setLoginError("Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render login UI only if not authenticated
  if (isAuthenticated) {
    return null; // Hide login UI when authenticated (handled by App)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-[36rem] w-full bg-white shadow-sm rounded-lg p-12 mx-4">
        <div className="flex flex-col items-center mb-10">
          <div className="p-2.5 rounded-md flex items-center justify-center bg-gradient-to-br from-[#0ea5e9] to-[#0369a1] mb-6">
            <HomeIcon className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Welcome to ER Request Management
          </h1>
          <p className="mt-3 text-center text-gray-600">
            Please sign in with your organizational account
          </p>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            {loginError}
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={isLoading || inProgress !== "none"}
          className={`w-full flex justify-center items-center py-3 px-4 rounded-md ${
            isLoading
              ? "bg-[#80c2e6] cursor-not-allowed"
              : "bg-[#0284c7] hover:bg-[#0369a1]"
          } text-white font-medium transition-colors shadow-sm`}
        >
          {isLoading ? "Signing in..." : "Sign in with Microsoft"}
        </button>

        <div className="mt-8 text-center text-sm text-gray-500">
          By signing in, you agree to our{" "}
          <a href="#" className="text-[#0284c7] hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#0284c7] hover:underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default LoginPage;