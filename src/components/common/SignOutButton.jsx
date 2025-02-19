// src/components/common/SignOutButton.jsx
import React from "react";
import { useMsal } from "@azure/msal-react";

export const SignOutButton = ({ className = "" }) => {
  const { instance } = useMsal();

  const handleLogout = (logoutType) => {
    if (logoutType === "popup") {
      instance
        .logoutPopup({
          postLogoutRedirectUri: window.location.origin,
        })
        .catch((error) => {
          console.error("Logout failed:", error);
        });
    } else {
      instance
        .logoutRedirect({
          postLogoutRedirectUri: window.location.origin,
        })
        .catch((error) => {
          console.error("Logout redirect failed:", error);
        });
    }
  };

  return (
    <button
      onClick={() => handleLogout("redirect")}
      className={`bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition duration-200 ease-in-out ${className}`}
    >
      Sign out
    </button>
  );
};
