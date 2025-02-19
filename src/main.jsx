// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "../authConfig"; // Make sure this path is correct
import store from "./store";
import App from "./App";
import "./App.css";

// MSAL instance setup - properly initialize first
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize first, then handle redirects
msalInstance
  .initialize()
  .then(() => {
    console.log("MSAL initialized successfully");

    // Now it's safe to handle redirects
    msalInstance
      .handleRedirectPromise()
      .then((response) => {
        if (response) {
          console.log("Redirect response received", response);

          // Set active account if we have one
          if (response.account) {
            msalInstance.setActiveAccount(response.account);
          }
        }
      })
      .catch((error) => {
        console.error("Redirect error:", error);
      });
  })
  .catch((err) => {
    console.error("MSAL initialization failed:", err);
  });

// Set active account if one exists
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
    const account = event.payload.account;
    console.log("Auth event success, setting active account:", account);
    msalInstance.setActiveAccount(account);
  }

  if (
    event.eventType === EventType.LOGIN_FAILURE ||
    event.eventType === EventType.ACQUIRE_TOKEN_FAILURE
  ) {
    console.error("Auth event failure:", event.error);
  }
});

// Render React app
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
