// src/Pages/ProfilePage.jsx
import React from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { Navigate } from "react-router-dom";
import UserProfile from "../components/common/UserProfile";

const ProfilePage = () => {
  return (
    <>
      <AuthenticatedTemplate>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Your Profile
            </h1>
            <UserProfile />
          </div>
        </div>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Navigate to="/login" replace />
      </UnauthenticatedTemplate>
    </>
  );
};

export default ProfilePage;
