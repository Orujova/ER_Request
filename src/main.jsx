import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "../authConfig";
import { verifyTokenWithBackend } from "./utils/authHandler";
import store from "./redux/store";
import App from "./App";
import "./App.css";

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

const handleAuthSuccess = async (response) => {
  try {
    if (response?.accessToken) {
      await verifyTokenWithBackend(response.accessToken);

      if (response.account) {
        msalInstance.setActiveAccount(response.account);
      }
    }
  } catch (error) {
    console.error("Token verification failed:", error);
  }
};

// Handle redirect promise only once on initial load
const handleRedirectPromise = async () => {
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      // console.log("Redirect response received", response);
      await handleAuthSuccess(response);
    }
  } catch (error) {
    console.error("Redirect error:", error);
  }
};

// Initialize MSAL and handle redirect
msalInstance
  .initialize()
  .then(() => {
    return handleRedirectPromise();
  })
  .catch((err) => {
    console.error("MSAL initialization failed:", err);
  });

// Set active account if exists
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

// Add event callback for login events
msalInstance.addEventCallback((event) => {
  if (
    (event.eventType === EventType.LOGIN_SUCCESS ||
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
    event.payload.account
  ) {
    handleAuthSuccess(event.payload);
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
