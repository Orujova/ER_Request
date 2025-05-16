// src/Pages/LoginPage.jsx
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { loginRequest } from "../../authConfig";
import { HomeIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getDefaultRedirect } from "../utils/roles";
import {
  verifyTokenWithBackend,
  checkInitialAuthState,
  getStoredTokens,
} from "../utils/authHandler";

const LoginPage = () => {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress, accounts } = useMsal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const authInProgress = useRef(false);
  const redirected = useRef(false); // New ref to track if we've already redirected

  // Get intended destination from state or default
  const from = location.state?.from?.pathname || getDefaultRedirect();

  // Check for existing valid auth without waiting for MSAL
  useEffect(() => {
    const quickAuthCheck = async () => {
      // If already checked auth in progress or already redirected, don't do it again
      if (authInProgress.current || redirected.current) return;

      // Check if we already have valid auth state from cookies
      if (checkInitialAuthState()) {
        // We're already authenticated based on cookies, redirect to intended destination
        redirected.current = true;
        navigate(from, { replace: true });
        return;
      }
    };

    quickAuthCheck();
  }, [navigate, from]);

  // Handle authentication process with MSAL
  useEffect(() => {
    // Prevent duplicate auth attempts and loops
    if (
      authInProgress.current ||
      redirected.current || // Don't authenticate if already redirected
      !isAuthenticated ||
      !accounts?.length ||
      inProgress !== "none"
    ) {
      return;
    }

    const handleAuthentication = async () => {
      // Set flags to prevent multiple calls
      authInProgress.current = true;
      setIsLoading(true);

      try {
        // Check if we already have a stored token from previous auth
        const { msalToken } = getStoredTokens();

        if (msalToken) {
          // Verify the existing token with backend
          await verifyTokenWithBackend(msalToken);
        } else {
          // Get token silently if no stored token
          const tokenResponse = await instance.acquireTokenSilent({
            account: accounts[0],
            scopes: loginRequest.scopes,
          });

          // Verify token with backend
          await verifyTokenWithBackend(tokenResponse.accessToken);
        }

        // Prevent multiple redirects
        redirected.current = true;

        // Force a small delay before redirect to ensure state updates
        setTimeout(() => {
          // Redirect to intended destination
          navigate(from, { replace: true });
        }, 100);
      } catch (error) {
        console.error("Authentication error:", error);
        setLoginError("Authentication failed. Please try again.");
        // Don't navigate on error - stay on login page
      } finally {
        setIsLoading(false);
        // Allow another attempt after a delay
        setTimeout(() => {
          authInProgress.current = false;
        }, 2000);
      }
    };

    handleAuthentication();
  }, [isAuthenticated, accounts, instance, navigate, from, inProgress]);

  // If we're already authenticated, redirect immediately to prevent showing login page
  if (isAuthenticated && checkInitialAuthState() && !redirected.current) {
    redirected.current = true;
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async () => {
    // Prevent multiple login attempts
    if (inProgress !== "none" || isLoading || authInProgress.current) {
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      await instance.loginRedirect({
        ...loginRequest,
        // Store the return URL in state
        state: JSON.stringify({ returnUrl: from }),
      });
    } catch (error) {
      console.error("Login redirect failed:", error);
      setLoginError("Sign-in failed. Please try again.");
      setIsLoading(false);
      authInProgress.current = false;
    }
  };

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
