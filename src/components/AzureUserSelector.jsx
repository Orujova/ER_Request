import React, { useState, useCallback, useEffect, useRef } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { Search, User, Loader, AlertCircle, X } from "lucide-react";
import { graphConfig } from "../../authConfig";

const AzureUsers = ({ onSelect, selectedUsers = [], onRemove }) => {
  const { instance, accounts } = useMsal();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  const searchUsers = useCallback(
    async (query) => {
      if (!query || query.length < 3) {
        setUsers([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const account = accounts[0];
        const silentRequest = {
          scopes: ["User.Read.All"],
          account,
        };

        let tokenResponse;
        try {
          tokenResponse = await instance.acquireTokenSilent(silentRequest);
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            // Fallback to interactive login if silent login fails
            tokenResponse = await instance.acquireTokenPopup(silentRequest);
          } else {
            throw error; // Re-throw other errors
          }
        }

        // Modified to search by displayName and userPrincipalName
        const searchUrl = `${graphConfig.graphUsersEndpoint}?$filter=startswith(displayName,'${query}') or startswith(userPrincipalName,'${query}')&$select=id,displayName,userPrincipalName,jobTitle&$top=10`;

        const response = await fetch(searchUrl, {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.value);
      } catch (err) {
        setError(err.message || "Failed to search users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [instance, accounts]
  );

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, searchUsers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = (user) => {
    onSelect(user);
    setSearchQuery("");
    setUsers([]);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setUsers([]);
  };

  return (
    <div className="space-y-3">
      <div ref={dropdownRef} className="relative">
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-3 pl-10 pr-10 rounded-xl border-2 border-gray-200 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
            placeholder="Search for users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User needs instructions */}
        {!searchQuery && isFocused && (
          <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideDown">
            <div className="flex items-center gap-2 text-gray-600">
              <User size={18} />
              <p className="text-sm">
                Type at least 3 characters to search for users
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && searchQuery.length >= 3 && (
          <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideDown">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader size={18} className="animate-spin" />
              <p className="text-sm">Searching users...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideDown">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle size={18} />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* No results */}
        {!loading &&
          users.length === 0 &&
          searchQuery.length >= 3 &&
          isFocused &&
          !error && (
            <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slideDown">
              <div className="flex items-center gap-2 text-gray-600">
                <User size={18} />
                <p className="text-sm">
                  No users found matching "{searchQuery}"
                </p>
              </div>
            </div>
          )}

        {/* Results list */}
        {users.length > 0 && isFocused && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 animate-slideDown divide-y divide-gray-100">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.userPrincipalName}
                    </div>
                    {user.jobTitle && (
                      <div className="text-xs text-gray-400 mt-1">
                        {user.jobTitle}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-sky-50 px-3 py-2 rounded-lg flex items-center gap-2 border border-sky-100 group transition-all"
            >
              {/* <span className="text-sm font-medium text-sky-700">
                {user.displayName}
              </span> */}
              <span className="text-xs text-sky-500">
                {user.userPrincipalName}
              </span>
              <button
                type="button"
                onClick={() => onRemove(user)}
                className="text-sky-400 hover:text-sky-600 group-hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AzureUsers;
