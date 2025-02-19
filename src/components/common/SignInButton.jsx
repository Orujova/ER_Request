// src/components/common/SignInButton.jsx

import { useMsal } from "@azure/msal-react";
import { getLoginParameters } from "../../utils/authService";
import { loginRequest } from "../../../authConfig";
export const SignInButton = ({ className = "" }) => {
  const { instance } = useMsal();

  // const handleLogin = (loginType) => {
  //   if (loginType === "popup") {
  //     instance.loginPopup(getLoginParameters()).catch((error) => {
  //       console.error("Login failed:", error);
  //     });
  //   } else {
  //     instance.loginRedirect(getLoginParameters()).catch((error) => {
  //       console.error("Login redirect failed:", error);
  //     });
  //   }
  // };

  const handleLogin = async () => {
    try {
      // Try popup login instead of redirect
      const result = await instance.loginPopup(loginRequest);
      console.log("Login successful", result);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <button
      onClick={() => handleLogin()}
      className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 ease-in-out ${className}`}
    >
      Sign in
    </button>
  );
};
