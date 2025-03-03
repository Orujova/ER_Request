// src/Pages/LoginPage.jsx
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Navigate } from "react-router-dom";
import { loginRequest } from "../../authConfig";
import { HomeIcon } from "lucide-react";

const LoginPage = () => {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async () => {
    if (inProgress !== "none") {
      return;
    }

    try {
      if (!instance.initialized) {
        await instance.initialize();
      }
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Redirect login failed:", error);
      try {
        await instance.loginPopup(loginRequest);
      } catch (popupError) {
        console.error("Popup login also failed:", popupError);
      }
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

        <button
          onClick={handleSignIn}
          className="w-full flex justify-center items-center py-3 px-4 rounded-md bg-[#0284c7] text-white font-medium hover:bg-[#0369a1] transition-colors  shadow-sm"
        >
          Sign in with Microsoft
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
