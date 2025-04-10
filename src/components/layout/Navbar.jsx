// src/components/layout/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Flex,
  Button,
  Box,
  Text,
  IconButton,
  DropdownMenu,
  Avatar,
  Separator,
  Tooltip,
} from "@radix-ui/themes";
import {
  HomeIcon,
  Settings2,
  LayoutGrid,
  PlusCircle,
  BellIcon,
  Menu,
  UserCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { AuthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "../../../authConfig";
import { callMsGraph } from "../../utils/authService";
import { themeColors } from "../../styles/theme";
import NavButton from "./NavButton";
import UserMenuContent from "../auth/UserMenuContent";
import AppLogo from "./AppLogo";
// Import role utilities
import {
  ROLES,
  hasRole,
  hasAdminAccess,
  hasAccess,
  canAccessRoute,
} from "../../utils/roles";
// Import auth handler utils
import {
  checkInitialAuthState,
  clearAuthTokens,
  getUserInfo,
} from "../../utils/authHandler";

function Navbar() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts, inProgress } = useMsal();
  const [userData, setUserData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);

  // Use useLocation to track the current path
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // Check if locally authenticated from cookies
  useEffect(() => {
    const checkLocalAuth = () => {
      const isAuth = checkInitialAuthState();
      setIsLocallyAuthenticated(isAuth);

      // If locally authenticated but MSAL not initialized, attempt to initialize
      if (isAuth && !isAuthenticated && inProgress === "none") {
        // Just set the state for now, no need to force MSAL redirect
        // This ensures navbar appears while auth is being set up
      }
    };

    checkLocalAuth();
    // Set interval to periodically check auth state
    const interval = setInterval(checkLocalAuth, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, inProgress]);

  const activeAccount = instance.getActiveAccount();
  const currentAccount = activeAccount || accounts[0];
  const username = currentAccount?.username || currentAccount?.name || "";

  // Update current path whenever location changes
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  // Get user info from cookies if not available from MSAL
  const userInfoFromCookies = getUserInfo();

  // Use cookie data if MSAL data isn't available yet
  const effectiveUsername = username || userInfoFromCookies?.email || "";

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      // Use either MSAL auth or local auth check
      if (
        (!isAuthenticated && !isLocallyAuthenticated) ||
        (!currentAccount && !userInfoFromCookies) ||
        inProgress !== "none"
      ) {
        return;
      }

      // If we already have user data, don't fetch again
      if (userData) return;

      // If we have user info from cookies, use that
      if (userInfoFromCookies && !userData) {
        setUserData({
          displayName: userInfoFromCookies.fullName,
          mail: userInfoFromCookies.email,
          // Add any other fields you need
        });
        return;
      }

      try {
        if (!instance.getActiveAccount() && accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
        }

        // Only attempt to get token if we have a current account
        if (currentAccount) {
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: currentAccount,
          });

          try {
            const graphData = await callMsGraph(response.accessToken);
            setUserData(graphData);
          } catch (graphError) {
            console.error("Error fetching MS Graph data:", graphError);
          }
        }
      } catch (error) {
        console.error("Token acquisition error:", error);
        // Don't attempt redirect here, just use cookie data
      }
    };

    fetchUserData();
  }, [
    isAuthenticated,
    isLocallyAuthenticated,
    currentAccount,
    instance,
    inProgress,
    accounts,
    userInfoFromCookies,
    userData,
  ]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear local auth tokens first
      clearAuthTokens();
      localStorage.removeItem("rols");

      // Then logout from MSAL
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin + "/login",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // If MSAL logout fails, still redirect to login
      window.location.href = "/login";
    }
  };

  // Get first letter of username for avatar
  const userInitial = effectiveUsername
    ? effectiveUsername.charAt(0).toUpperCase()
    : "U";

  // Get display name (before @ in email)
  const displayName = effectiveUsername ? effectiveUsername.split("@")[0] : "";

  // Use graph data display name if available
  const graphDisplayName =
    userData?.displayName || userInfoFromCookies?.fullName || displayName;

  // Check user permissions for specific routes
  const canAccessAdmin = hasAdminAccess();
  const canAccess = hasAccess();
  const canAccessMatrix = canAccessRoute("/request-matrix");
  const canAccessDashboard = canAccessRoute("/");
  const isRegularUser = hasRole(ROLES.USER);

  // Only show navbar if authenticated (either through MSAL or cookies)
  if (!isAuthenticated && !isLocallyAuthenticated) {
    return null;
  }

  return (
    <Box
      className="sticky top-0 z-50 w-full backdrop-blur-sm"
      style={{
        borderBottom: `1px solid ${themeColors.border}`,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        boxShadow: themeColors.navShadow,
      }}
    >
      <Box className="mx-auto px-4 md:px-6 max-w-layout">
        <Flex py="4" justify="between" align="center">
          {/* Logo & App Name - Not clickable for regular users */}
          <Box
          // style={{
          //   pointerEvents:
          //     isRegularUser && currentPath !== "/" ? "none" : "auto",
          // }}
          >
            <AppLogo
              isAuthenticated={isAuthenticated || isLocallyAuthenticated}
            />
          </Box>

          {/* Desktop Navigation */}
          <Flex
            gap="4"
            align="center"
            display={{ initial: "none", md: "flex" }}
          >
            {/* Only show Admin button if user has admin access */}
            {canAccessAdmin && (
              <NavButton
                to="/admin"
                icon={Settings2}
                isActive={currentPath === "/admin"}
              >
                Admin
              </NavButton>
            )}

            {/* Only show Matrix button if user has access */}
            {canAccessMatrix && (
              <NavButton
                to="/request-matrix"
                icon={LayoutGrid}
                isActive={currentPath === "/request-matrix"}
              >
                Matrix
              </NavButton>
            )}

            {/* Always show New Request button */}
            <NavButton
              to="/create-request"
              icon={PlusCircle}
              variant="primary"
              isActive={currentPath === "/create-request"}
            >
              New Request
            </NavButton>

            <Separator
              orientation="vertical"
              size="1"
              className="mx-2 h-6"
              style={{ backgroundColor: themeColors.border }}
            />

            <Flex gap="4" align="center">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Flex align="center" gap="2" className="cursor-pointer group">
                    <Avatar
                      size="2"
                      src={userData?.photo || ""}
                      fallback={userInitial}
                      radius="full"
                      className="ring-2 ring-offset-2 group-hover:ring-opacity-100 transition-all duration-200"
                      style={{
                        ringColor: "rgba(8, 145, 178, 0.1)",
                        ringOpacity: "0.5",
                        color: !userData?.photo ? "white" : undefined,
                      }}
                    />
                  </Flex>
                </DropdownMenu.Trigger>

                <UserMenuContent
                  userData={userData}
                  graphDisplayName={graphDisplayName}
                  handleLogout={handleLogout}
                />
              </DropdownMenu.Root>
            </Flex>
          </Flex>

          {/* Mobile Navigation */}
          <Box display={{ initial: "block", md: "none" }}>
            <Flex gap="4" align="center">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton
                    variant="ghost"
                    size="2"
                    className="rounded-full hover:bg-slate-50 transition-colors p-2"
                  >
                    <Menu size={19} />
                  </IconButton>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    border: `1px solid ${themeColors.border}`,
                    padding: "6px",
                  }}
                >
                  <DropdownMenu.Label>
                    <Flex align="center" gap="2" className="px-1 py-1.5">
                      <Avatar
                        size="2"
                        src={userData?.photo || ""}
                        fallback={userInitial}
                        radius="full"
                        style={{
                          backgroundColor: !userData?.photo
                            ? themeColors.primaryGradientEnd
                            : undefined,
                          color: !userData?.photo ? "white" : undefined,
                        }}
                      />
                      <Flex direction="column" align="start">
                        <Text size="2" weight="medium">
                          {graphDisplayName}
                        </Text>
                        {(userData?.mail || userInfoFromCookies?.email) && (
                          <Text
                            size="1"
                            style={{ color: themeColors.textLight }}
                          >
                            {userData?.mail || userInfoFromCookies?.email}
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator style={{ margin: "6px 0" }} />

                  {/* Only show Admin option if user has admin access */}
                  {canAccessAdmin && (
                    <DropdownMenu.Item className="py-1.5 rounded-md">
                      <Link
                        to="/admin"
                        className="no-underline text-inherit w-full"
                      >
                        <Flex gap="2" align="center">
                          <Settings2 size={16} />
                          Admin Panel
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>
                  )}

                  {/* Only show Matrix option if user has access */}
                  {canAccessMatrix && (
                    <DropdownMenu.Item className="py-1.5 rounded-md">
                      <Link
                        to="/request-matrix"
                        className="no-underline text-inherit w-full"
                      >
                        <Flex gap="2" align="center">
                          <LayoutGrid size={16} />
                          Request Matrix
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>
                  )}

                  {/* Always show Create Request option */}
                  <DropdownMenu.Item
                    className="py-1.5 rounded-md"
                    style={{
                      backgroundColor: themeColors.primary,
                      color: "white",
                    }}
                  >
                    <Link
                      to="/create-request"
                      className="no-underline text-white w-full"
                    >
                      <Flex gap="2" align="center">
                        <PlusCircle size={16} />
                        Create Request
                      </Flex>
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator style={{ margin: "6px 0" }} />
                  <DropdownMenu.Item className="py-1.5 rounded-md">
                    <Link
                      to="/profile"
                      className="no-underline text-inherit w-full"
                    >
                      <Flex gap="2" align="center">
                        <UserCircle size={16} />
                        Profile
                      </Flex>
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator style={{ margin: "6px 0" }} />
                  <DropdownMenu.Item
                    color="red"
                    onClick={handleLogout}
                    className="py-1.5 rounded-md"
                  >
                    <Flex gap="2" align="center">
                      <LogOut size={16} />
                      Log Out
                    </Flex>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Add shimmer animation keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </Box>
  );
}

export default Navbar;
