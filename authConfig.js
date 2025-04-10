// authConfig.js

// import { LogLevel } from "@azure/msal-browser";
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {},
};

// Add scopes for the ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: [
    "User.Read",
    "openid",
    "profile",
    "email",
    "Mail.ReadBasic",
    "Mail.Send",
    "Mail.ReadWrite",
    "Mail.Read",
  ],
};

// Add endpoints for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphMailEndpoint: "https://graph.microsoft.com/v1.0/me/messages",
  graphDirectoryEndpoint: "https://graph.microsoft.com/v1.0/directoryObjects",
  graphUsersEndpoint: "https://graph.microsoft.com/v1.0/users",
};

// Add your API endpoints
export const apiConfig = {
  endpoint: import.meta.env.VITE_API_ENDPOINT,
  backendEndpoint: import.meta.env.VITE_BACKEND_API_ENDPOINT,
  backendEndpoint2: import.meta.env.VITE_BACKEND_API_ENDPOINT2,
};
