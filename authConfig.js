// authConfig.js

// import { LogLevel } from "@azure/msal-browser";
export const msalConfig = {
  auth: {
    clientId: "0148bfb9-635c-44d4-997d-42a69c30d111",
    authority:
      "https://login.microsoftonline.com/c660a74e-c1ac-4c58-81cb-e2654148fcb7",
    redirectUri: "http://localhost:3015",
    postLogoutRedirectUri: "http://localhost:3015",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {},
};

// Add scopes for the ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

// Add endpoints for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

// Add your API endpoints
export const apiConfig = {
  endpoint: "http://localhost:3015/api",
  backendEndpoint: "http://127.0.0.1:8000/api",
  backendEndpoint2: "http://127.0.0.1:8000",
};
