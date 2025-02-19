// src/components/common/AuthGuard.jsx

// import { Navigate } from "react-router-dom";
// import { useIsAuthenticated } from "@azure/msal-react";

// export const AuthGuard = ({ children }) => {
//   const isAuthenticated = useIsAuthenticated();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export const AuthGuard = ({ children }) => {
  const { instance, accounts } = useMsal();
  const location = useLocation();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsAuthChecking(true);

      if (accounts.length > 0) {
        try {
          // Sessizce token alarak kimlik doğrulamayı kontrol et
          await instance.acquireTokenSilent({
            scopes: ["User.Read"],
            account: accounts[0],
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Silent token acquisition failed:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsAuthChecking(false);
    };

    checkAuthentication();
  }, [instance, accounts]);

  // Kimlik doğrulama kontrol edilirken yükleme göster
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl">Yükleniyor...</p>
      </div>
    );
  }

  // Kimlik doğrulama başarısız olduysa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kimlik doğrulama başarılıysa, çocuk bileşenleri göster
  return children;
};
