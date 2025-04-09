// File: components/email/EmailInput.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, User, Users } from "lucide-react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { graphConfig } from "../../../authConfig";
import { Loader, AlertCircle } from "lucide-react";

const EmailInput = ({
  recipients,
  setRecipients,
  placeholder,
  label,
  type,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [azureUsers, setAzureUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { instance, accounts } = useMsal();

  // Check if input is an email
  const isValidEmail = (email) => {
    return email.includes("@");
  };

  // Handle adding a typed email
  const handleAddManualEmail = () => {
    if (
      inputValue &&
      isValidEmail(inputValue) &&
      !recipients.includes(inputValue)
    ) {
      setRecipients([...recipients, inputValue]);
      setInputValue("");
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (email) => {
    setRecipients(recipients.filter((recipient) => recipient !== email));
  };

  // Search Azure users
  const searchAzureUsers = useCallback(
    async (query) => {
      if (!query || query.length < 2) {
        setAzureUsers([]);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);

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
            tokenResponse = await instance.acquireTokenPopup(silentRequest);
          } else {
            throw error;
          }
        }

        const searchUrl = `${graphConfig.graphUsersEndpoint}?$filter=startswith(displayName,'${query}') or startswith(userPrincipalName,'${query}')&$select=id,displayName,userPrincipalName,jobTitle&$top=5`;

        const response = await fetch(searchUrl, {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setAzureUsers(data.value);
      } catch (err) {
        setSearchError(err.message || "Failed to search users");
        setAzureUsers([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [instance, accounts]
  );

  // Debounce search
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (inputValue) {
        searchAzureUsers(inputValue);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [inputValue, searchAzureUsers]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selecting an Azure user
  const handleSelectAzureUser = (user) => {
    if (!recipients.includes(user.userPrincipalName)) {
      setRecipients([...recipients, user.userPrincipalName]);
    }
    setInputValue("");
    setAzureUsers([]);
    inputRef.current?.focus();
  };

  // Render the dropdown content
  const renderDropdownContent = () => {
    if (searchLoading) {
      return (
        <div className="p-3 text-sm text-slate-600 flex items-center">
          <Loader className="h-4 w-4 mr-2 animate-spin" />
          <span>Searching users...</span>
        </div>
      );
    }

    if (searchError) {
      return (
        <div className="p-3 text-sm text-red-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{searchError}</span>
        </div>
      );
    }

    if (azureUsers.length === 0 && inputValue.length >= 2) {
      return (
        <div className="p-3 text-sm text-slate-600">
          No users found matching "{inputValue}"
        </div>
      );
    }

    return (
      <>
        {azureUsers.map((user) => (
          <div
            key={user.id}
            className="p-2.5 hover:bg-slate-100 cursor-pointer flex items-center"
            onClick={() => handleSelectAzureUser(user)}
          >
            <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mr-2.5">
              <User className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-sm font-medium">{user.displayName}</div>
              <div className="text-xs text-slate-500">
                {user.userPrincipalName}
              </div>
            </div>
          </div>
        ))}
        {isValidEmail(inputValue) && !recipients.includes(inputValue) && (
          <div
            className="p-2.5 hover:bg-slate-100 cursor-pointer flex items-center text-cyan-600"
            onClick={handleAddManualEmail}
          >
            <div className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mr-2.5">
              <Send className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-sm">Add "{inputValue}"</div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col" ref={dropdownRef}>
      <label className="text-xs font-medium text-slate-600 mb-1">
        {label}:
      </label>
      <div className="relative">
        <div className="flex flex-wrap items-center gap-1.5 border border-slate-300 rounded-md p-2 bg-white focus-within:ring-1 focus-within:ring-cyan-200 focus-within:border-cyan-400 transition-all min-h-[42px]">
          {recipients.map((email) => (
            <div
              key={email}
              className="flex items-center bg-cyan-50 border border-cyan-200 rounded-md px-2 py-1 text-xs"
            >
              <span className="mr-1 text-slate-700">{email}</span>
              <button
                type="button"
                onClick={() => handleRemoveRecipient(email)}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddManualEmail();
              }
            }}
            onBlur={() => {
              // Delay to allow clicking dropdown items
              setTimeout(() => {
                if (isValidEmail(inputValue)) {
                  handleAddManualEmail();
                }
              }, 200);
            }}
            placeholder={recipients.length > 0 ? "Add more..." : placeholder}
            className="flex-1 outline-none bg-transparent text-sm min-w-[120px] py-1 px-2"
          />
          <div className="text-slate-400">
            <Users className="h-4 w-4" />
          </div>
        </div>

        {isFocused && (inputValue.length >= 2 || azureUsers.length > 0) && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-md z-50 max-h-64 overflow-y-auto">
            {renderDropdownContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailInput;
