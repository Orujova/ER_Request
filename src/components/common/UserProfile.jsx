// src/components/common/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { callMsGraph } from "../../utils/authService";
import { getLoginParameters } from "../../utils/authService";

const UserProfile = () => {
  const { instance, accounts } = useMsal();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfileData = async () => {
    if (accounts.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const request = {
        ...getLoginParameters(),
        account: accounts[0],
      };

      const response = await instance.acquireTokenSilent(request);
      const data = await callMsGraph(response.accessToken);
      setProfileData(data);
    } catch (silentError) {
      // Silent token acquisition failed, falling back to redirect
      if (
        silentError instanceof Error &&
        silentError.message.includes("interaction_required")
      ) {
        try {
          await instance.acquireTokenRedirect(getLoginParameters());
        } catch (redirectError) {
          setError("Failed to acquire token: " + redirectError.message);
        }
      } else {
        setError("Error fetching profile data: " + silentError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchProfileData();
    }
  }, [accounts]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          onClick={fetchProfileData}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-4">
        <button
          onClick={fetchProfileData}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Fetch Profile Information
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <div className="space-y-3">
        {profileData.displayName && (
          <p>
            <span className="font-medium">Name:</span> {profileData.displayName}
          </p>
        )}
        {profileData.givenName && (
          <p>
            <span className="font-medium">First Name:</span>{" "}
            {profileData.givenName}
          </p>
        )}
        {profileData.surname && (
          <p>
            <span className="font-medium">Last Name:</span>{" "}
            {profileData.surname}
          </p>
        )}
        {profileData.jobTitle && (
          <p>
            <span className="font-medium">Job Title:</span>{" "}
            {profileData.jobTitle}
          </p>
        )}
        {profileData.mail && (
          <p>
            <span className="font-medium">Email:</span> {profileData.mail}
          </p>
        )}
        {profileData.userPrincipalName && !profileData.mail && (
          <p>
            <span className="font-medium">Email:</span>{" "}
            {profileData.userPrincipalName}
          </p>
        )}
        {profileData.id && (
          <p>
            <span className="font-medium">ID:</span> {profileData.id}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
